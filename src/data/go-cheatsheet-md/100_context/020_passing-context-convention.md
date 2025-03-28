---
title: "Context パッケージ: Context の受け渡し規約"
tags: ["context", "concurrency", "規約", "関数シグネチャ", "第一引数"]
---

Goのコミュニティでは、`context.Context` を関数間で受け渡しする際に、広く受け入れられている**規約 (Convention)** があります。

この規約については、**「並行処理」**セクションの**「Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`)」** (`090_concurrency/210_using-context-in-functions-checking-done.md`) でも触れました。

## 規約: 第一引数として `ctx context.Context` を渡す

*   ブロッキングする可能性のある関数、外部リソース（ネットワーク、データベースなど）にアクセスする関数、あるいはリクエスト処理の一部として呼び出される関数は、**第一引数**として `ctx context.Context` を受け取るべきです。
*   引数名は `ctx` とするのが一般的です。
*   `Context` は**決して `nil` であってはなりません**。もしどの Context を使うべきか不明な場合は、`context.TODO()` を使いますが、これは一時的な措置であるべきです。
*   `Context` を構造体のフィールドとして**埋め込むべきではありません**。明示的に引数として渡すべきです。

```go title="Context を第一引数として渡す例"
package main

import (
	"context"
	"fmt"
	"time"
)

// データベースクエリを模倣する関数
// ★ 第一引数として ctx を受け取る ★
func queryDatabase(ctx context.Context, query string) (string, error) {
	fmt.Printf("データベースクエリ '%s' を実行中...\n", query)

	// Context のキャンセルをチェックしながら処理を行う (select を使う)
	select {
	case <-time.After(100 * time.Millisecond): // クエリに時間がかかると仮定
		fmt.Printf("クエリ '%s' 成功\n", query)
		return "結果データ", nil
	case <-ctx.Done(): // ★ Context がキャンセルされたかチェック
		fmt.Printf("クエリ '%s' はキャンセルされました: %v\n", query, ctx.Err())
		return "", ctx.Err() // キャンセル理由を返す
	}
}

// 上位の処理関数も Context を受け取り、下位の関数に渡す
func handleRequest(ctx context.Context, requestData string) error {
	fmt.Println("リクエスト処理開始")
	// ... 何らかの前処理 ...

	// 下位の関数に Context をそのまま渡す
	result, err := queryDatabase(ctx, fmt.Sprintf("SELECT data FROM table WHERE id='%s'", requestData))
	if err != nil {
		// エラーをラップして返す
		return fmt.Errorf("リクエスト処理失敗: %w", err)
	}

	fmt.Printf("取得結果: %s\n", result)
	fmt.Println("リクエスト処理完了")
	return nil
}

func main() {
	// ルート Context を作成
	rootCtx := context.Background()

	// タイムアウト付きの Context を作成
	ctxWithTimeout, cancel := context.WithTimeout(rootCtx, 50*time.Millisecond) // 50ms でタイムアウト
	defer cancel()

	fmt.Println("--- タイムアウトするケース ---")
	err1 := handleRequest(ctxWithTimeout, "data1") // タイムアウトするはず
	if err1 != nil {
		fmt.Println("エラー:", err1)
	}

	fmt.Println("\n--- 成功するケース ---")
	// タイムアウトしない Context (Background をそのまま使う)
	err2 := handleRequest(rootCtx, "data2") // 成功するはず
	if err2 != nil {
		fmt.Println("エラー:", err2)
	}
}

/* 実行結果:
--- タイムアウトするケース ---
リクエスト処理開始
データベースクエリ 'SELECT data FROM table WHERE id='data1'' を実行中...
クエリ 'SELECT data FROM table WHERE id='data1'' はキャンセルされました: context deadline exceeded
エラー: リクエスト処理失敗: クエリ 'SELECT data FROM table WHERE id='data1'' はキャンセルされました: context deadline exceeded

--- 成功するケース ---
リクエスト処理開始
データベースクエリ 'SELECT data FROM table WHERE id='data2'' を実行中...
クエリ 'SELECT data FROM table WHERE id='data2'' 成功
取得結果: 結果データ
リクエスト処理完了
*/
```

この規約に従うことで、Goのプログラム全体でキャンセルシグナルやデッドライン、リクエストスコープの値が一貫した方法で伝達されるようになり、コードの可読性や保守性が向上します。標準ライブラリや多くのサードパーティライブラリもこの規約に従っています。