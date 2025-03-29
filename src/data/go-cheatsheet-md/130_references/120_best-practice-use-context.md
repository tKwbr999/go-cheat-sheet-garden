## タイトル
title: "ベストプラクティス: Context を使う"

## タグ
tags: ["references", "best practice", "context", "concurrency", "cancel", "timeout", "deadline"]

## コード
```go
package main

import (
	"context"
	"errors" // errors.Is を使うため
	"fmt"
	"time"
	// "myproject/service" // 仮のサービスパッケージ
)

// Context を受け取るサービス関数 (仮)
func doWorkWithContext(ctx context.Context, input string) (string, error) {
	fmt.Printf("  (doWork: '%s' の処理開始)\n", input)
	select {
	case <-time.After(100 * time.Millisecond): // 時間のかかる処理を模倣
		fmt.Printf("  (doWork: '%s' の処理完了)\n", input)
		return "結果:" + input, nil
	case <-ctx.Done(): // キャンセルをチェック
		fmt.Printf("  (doWork: '%s' の処理キャンセル: %v)\n", input, ctx.Err())
		return "", ctx.Err()
	}
}

func main() {
	// 1. 起点となる Context
	rootCtx := context.Background()

	// 2. タイムアウト付き Context を生成
	ctx, cancel := context.WithTimeout(rootCtx, 50*time.Millisecond) // 50ms でタイムアウト
	// 3. defer cancel()
	defer cancel()

	fmt.Println("処理を開始します...")
	// 4. Context を関数に渡す
	result, err := doWorkWithContext(ctx, "my-data")

	// 6. (doWorkWithContext 内で) ctx.Done() がチェックされる
	// 7. エラーをチェック (タイムアウトを検知)
	if err != nil {
		fmt.Printf("エラーが発生しました: %v\n", err)
		if errors.Is(err, context.DeadlineExceeded) {
			fmt.Println("-> タイムアウトが原因です。")
		}
	} else {
		fmt.Printf("成功しました: %s\n", result)
	}
}

/* 実行結果:
処理を開始します...
  (doWork: 'my-data' の処理開始)
  (doWork: 'my-data' の処理キャンセル: context deadline exceeded)
エラーが発生しました: context deadline exceeded
-> タイムアウトが原因です。
*/
```

## 解説
```text
Goの並行処理や、外部リソースとのやり取りを含むプログラムにおいて、**`context.Context` を適切に利用する**ことは非常に重要なベストプラクティスです。

Context の概要、生成方法、使い方、キャンセルやタイムアウトの処理方法などについては、**「Context パッケージ」** (`100_context/`) ディレクトリ内の各ファイルで詳しく説明しました。

## なぜ Context を使うべきか？ (再確認)

*   **標準化されたキャンセル機構:** 複数の Goroutine や関数呼び出しにまたがる処理に対して、キャンセルシグナルを一貫した方法で伝播させることができます。これにより、不要になった処理を早期に中断し、リソースの浪費を防ぎます。
*   **タイムアウトとデッドライン:** 外部 API 呼び出しやデータベースクエリなど、完了時間が予測できない操作に対して、時間制限を簡単に設けることができます。これにより、システム全体の応答性を保ちます。
*   **リクエストスコープの値:** リクエストIDや認証情報など、リクエストに関連するデータを安全に関数間で引き回すための標準的な方法を提供します（ただし、必須パラメータの受け渡しには使わない）。
*   **エコシステムとの互換性:** Goの標準ライブラリ（`net/http`, `database/sql` など）や多くのサードパーティライブラリが `context.Context` をサポートしており、これらと連携する際に Context の利用が前提となることが多いです。

## 基本的な使い方（再確認）

1.  処理の起点（`main` 関数、HTTPハンドラなど）で `context.Background()` から Context を生成します。
2.  必要に応じて `context.WithCancel`, `context.WithTimeout`, `context.WithDeadline`, `context.WithValue` を使って派生 Context を作成します。
3.  **`defer cancel()`** を呼び出してリソースリークを防ぎます。
4.  ブロッキングする可能性のある関数や、外部と通信する関数には、**第一引数として Context を渡します**。
5.  Context を受け取った関数は、それをさらに下位の関数に**そのまま伝播**させます。
6.  時間のかかる処理や I/O 待ちを行う Goroutine 内では、`select` 文を使って **`ctx.Done()` チャネルを監視**し、キャンセルされたら速やかに処理を中断します。
7.  キャンセルされた場合は `ctx.Err()` で理由を確認できます。

Goで信頼性が高く、応答性の良い、リソース効率の良い並行プログラムやネットワークアプリケーションを構築するためには、`context` パッケージを正しく理解し、活用することが不可欠です。