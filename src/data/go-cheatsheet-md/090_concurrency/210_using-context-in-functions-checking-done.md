---
title: "並行処理: Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`) "
tags: ["concurrency", "goroutine", "context", "Done", "Err", "select", "キャンセル", "タイムアウト", "デッドライン"]
---

`context` パッケージの主な目的の一つは、処理の**キャンセル**や**タイムアウト/デッドライン**のシグナルを、関数呼び出しや Goroutine 間で伝達することです。これにより、不要になった処理や時間のかかりすぎている処理を早期に中断させ、リソースの浪費を防ぐことができます。

## Context の受け渡し規約

Context を利用する関数は、通常、その**第一引数**として `ctx context.Context` を受け取るように設計するのが Go の慣習です。

```go
func DoSomething(ctx context.Context, arg1 Type1, arg2 Type2) error {
	// ... ctx を使った処理 ...
}
```

呼び出し側は、`context.Background()` や、そこから派生させた Context (`WithCancel`, `WithTimeout` など) をこの第一引数に渡します。

## キャンセルの検知: `ctx.Done()` と `select`

`context.Context` インターフェースが持つ `Done()` メソッドは、**受信専用のチャネル (`<-chan struct{}`)** を返します。

*   **`Done() <-chan struct{}`**: このチャネルは、その Context が**キャンセル**される（またはタイムアウト/デッドラインに達する）と**クローズ**されます。Context がキャンセルされるまで、このチャネルからの受信はブロックします。

この `Done()` チャネルを `select` 文の `case` で使うことで、Context のキャンセルを検知できます。

```go
select {
case <-ctx.Done(): // ★ Done() チャネルから受信を試みる
	// Context がキャンセルされた場合の処理
	// (タイムアウト、デッドライン超過、または cancel() の呼び出し)
	err := ctx.Err() // キャンセル理由を取得
	fmt.Println("処理がキャンセルされました:", err)
	return err // または適切なエラー処理
case <-time.After(time.Second): // 例: 何らかの処理を待つ
	// 通常の処理
}
```

*   `case <-ctx.Done():`: `ctx.Done()` が返すチャネルからの受信を待ちます。Context がキャンセルされるとこのチャネルがクローズされ、ゼロ値 (`struct{}{}`) が受信可能になるため、この `case` が実行されます。
*   **`ctx.Err() error`**: `Done()` チャネルがクローズされた**後**に呼び出すと、Context がキャンセルされた理由を示すエラーを返します。
    *   `context.Canceled`: `cancel()` 関数が呼び出されたことによるキャンセルの場合。
    *   `context.DeadlineExceeded`: タイムアウトまたはデッドラインに達したことによるキャンセルの場合。
    *   `Done()` がまだクローズされていない場合は `nil` を返します。

## コード例: 時間のかかる処理のキャンセル

```go title="Context を使った処理のキャンセル"
package main

import (
	"context"
	"fmt"
	"time"
)

// 時間のかかる可能性のある処理を行う関数
// ctx を受け取り、キャンセルをチェックする
func longRunningTask(ctx context.Context, taskID int) error {
	fmt.Printf("タスク %d: 開始\n", taskID)

	// 処理の途中で定期的にキャンセルをチェックする例
	for i := 0; i < 5; i++ {
		select {
		case <-ctx.Done(): // ★ キャンセルシグナルをチェック
			fmt.Printf("タスク %d: キャンセルされました (%v)\n", taskID, ctx.Err())
			return ctx.Err() // キャンセル理由を返す
		case <-time.After(200 * time.Millisecond): // ★ 実際の処理や待機を模倣
			fmt.Printf("タスク %d: ステップ %d 完了\n", taskID, i+1)
		}
	}

	fmt.Printf("タスク %d: 正常終了\n", taskID)
	return nil
}

func main() {
	// --- ケース1: タイムアウトによるキャンセル ---
	fmt.Println("--- ケース1: タイムアウト (500ms) ---")
	// 500ms でタイムアウトする Context を作成
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancelTimeout() // defer で cancel を呼ぶ

	// Goroutine でタスクを実行 (タスク自体は 5 * 200ms = 1000ms かかるはず)
	err1 := longRunningTask(ctxTimeout, 1)
	if err1 != nil {
		fmt.Printf("メイン: タスク1のエラー: %v\n", err1) // context deadline exceeded
	}

	// --- ケース2: 明示的なキャンセル ---
	fmt.Println("\n--- ケース2: 明示的なキャンセル ---")
	// キャンセル可能な Context を作成
	ctxCancel, cancelFunc := context.WithCancel(context.Background())
	defer cancelFunc() // defer で cancel を呼ぶ

	// Goroutine でタスクを実行
	go func() {
		err2 := longRunningTask(ctxCancel, 2)
		if err2 != nil {
			// Goroutine 内でエラーをハンドリング (例)
			// fmt.Printf("Goroutine: タスク2のエラー: %v\n", err2)
		}
	}()

	// 300ms 後にキャンセル関数を呼び出す
	time.Sleep(300 * time.Millisecond)
	fmt.Println("メイン: cancelFunc() を呼び出してタスク2をキャンセルします...")
	cancelFunc()

	// 少し待って Goroutine が終了するのを確認
	time.Sleep(100 * time.Millisecond)
	fmt.Println("メイン: 終了")
}

/* 実行結果の例:
--- ケース1: タイムアウト (500ms) ---
タスク 1: 開始
タスク 1: ステップ 1 完了
タスク 1: ステップ 2 完了
タスク 1: キャンセルされました (context deadline exceeded)
メイン: タスク1のエラー: context deadline exceeded

--- ケース2: 明示的なキャンセル ---
タスク 2: 開始
タスク 2: ステップ 1 完了
メイン: cancelFunc() を呼び出してタスク2をキャンセルします...
タスク 2: キャンセルされました (context canceled)
メイン: 終了
*/
```

**コード解説:**

*   `longRunningTask` 関数は第一引数に `ctx context.Context` を受け取ります。
*   関数内の `for` ループで、`select` 文を使って `ctx.Done()` と `time.After` (処理の模倣) を待ち受けます。
*   もし `ctx.Done()` から受信できれば（つまり Context がキャンセルされれば）、キャンセルされた旨のメッセージを出力し、`ctx.Err()` で取得したキャンセル理由（`context.DeadlineExceeded` または `context.Canceled`）を返して関数を終了します。
*   `main` 関数では、`context.WithTimeout` と `context.WithCancel` を使って Context を生成し、`longRunningTask` に渡しています。
*   ケース1では、タスク完了前にタイムアウト (500ms) を迎えるため、`longRunningTask` は `ctx.Done()` を検知し、`context.DeadlineExceeded` エラーを返します。
*   ケース2では、`main` 関数が 300ms 後に `cancelFunc()` を呼び出すため、`longRunningTask` はその時点で `ctx.Done()` を検知し、`context.Canceled` エラーを返します。

このように、時間のかかる処理やブロックする可能性のある処理を行う関数には `context.Context` を渡し、関数内部で `ctx.Done()` をチェックすることで、外部からのキャンセル要求に適切に対応できるようになります。これは、レスポンスの良い、リソース効率の高いアプリケーションを構築するために非常に重要です。