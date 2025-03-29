## タイトル
title: "Context パッケージ: Context の伝播"

## タグ
tags: ["context", "concurrency", "関数呼び出し", "伝播"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 下位の関数: Context を受け取る
func queryDatabase(ctx context.Context, query string) (string, error) {
	fmt.Printf("データベースクエリ '%s' を実行中...\n", query)
	select {
	case <-time.After(100 * time.Millisecond):
		fmt.Printf("クエリ '%s' 成功\n", query)
		return "結果データ", nil
	case <-ctx.Done(): // ★ 上位から渡された Context のキャンセルをチェック
		fmt.Printf("クエリ '%s' はキャンセルされました: %v\n", query, ctx.Err())
		return "", ctx.Err()
	}
}

// 上位の関数: Context を受け取り、下位の関数にそのまま渡す
func handleRequest(ctx context.Context, requestData string) error {
	fmt.Println("リクエスト処理開始")
	// ★ 受け取った ctx をそのまま queryDatabase に渡す ★
	result, err := queryDatabase(ctx, fmt.Sprintf("SELECT data WHERE id='%s'", requestData))
	if err != nil {
		return fmt.Errorf("リクエスト処理失敗: %w", err)
	}
	fmt.Printf("取得結果: %s\n", result)
	fmt.Println("リクエスト処理完了")
	return nil
}

func main() {
	// タイムアウト付き Context を作成
	ctxWithTimeout, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	// handleRequest にタイムアウト付き Context を渡す
	// handleRequest はそれを queryDatabase に渡す
	// タイムアウト (50ms) がクエリの実行時間 (100ms) より短いため、キャンセルされる
	err := handleRequest(ctxWithTimeout, "data1")
	if err != nil {
		fmt.Println("エラー:", err)
	}
}

/* 実行結果:
リクエスト処理開始
データベースクエリ 'SELECT data WHERE id='data1'' を実行中...
クエリ 'SELECT data WHERE id='data1'' はキャンセルされました: context deadline exceeded
エラー: リクエスト処理失敗: クエリ 'SELECT data WHERE id='data1'' はキャンセルされました: context deadline exceeded
*/
```

## 解説
```text
`context.Context` を受け取る関数が、内部でさらに別の `context.Context` を受け取る関数を呼び出す場合、**受け取った Context をそのまま下位の関数に渡す**のが基本です。

この規約については、**「Context の受け渡し規約」** (`100_context/020_passing-context-convention.md`) でも触れました。

## Context を伝播させる理由

*   **キャンセル/デッドラインの伝播:** 親の Context がキャンセルされたり、デッドラインに達したりした場合、そのシグナルが子や孫の Context にも伝わります。Context をそのまま渡すことで、上位の処理からのキャンセル要求が、下位の処理（例: データベースクエリ、外部API呼び出し）にも正しく伝わり、処理全体を適切に中断させることができます。
*   **値の継承:** `context.WithValue` で設定された値は、子 Context にも引き継がれます。Context をそのまま渡すことで、リクエストスコープの値などを呼び出し階層全体で利用できます。

**やってはいけないこと:**

*   下位の関数を呼び出す際に、`context.Background()` や `context.TODO()` を新しく生成して渡すこと。これは、上位からのキャンセルシグナルなどを遮断してしまいます。
*   `nil` を Context として渡すこと。Context は `nil` であってはなりません。

**コード解説:**

*   `main` 関数で生成された `ctxWithTimeout` は `handleRequest` に渡されます。
*   `handleRequest` は、受け取った `ctx` を**変更せずに**そのまま `queryDatabase` に渡します。
*   `queryDatabase` 内の `select` で `<-ctx.Done()` をチェックすることで、`main` 関数で設定されたタイムアウト（50ms）を検知し、処理を中断できています。

もし `handleRequest` が `queryDatabase` を呼び出す際に `context.Background()` を渡していたら、タイムアウトは伝播せず、`queryDatabase` は 100ms 待機してしまい、期待通りに動作しません。

**Context を受け取る関数は、それを必要とする下位の関数にそのまま渡す**、これが Context を効果的に使うための基本原則です。