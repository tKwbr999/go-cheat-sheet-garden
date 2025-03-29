## タイトル
title: "Context パッケージ: キャンセルへの応答 (`ctx.Done()`)"

## タグ
tags: ["context", "concurrency", "goroutine", "Done", "select", "キャンセル"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 時間のかかる処理をシミュレートする関数 (再掲)
func longRunningTask(ctx context.Context, taskID int) error {
	fmt.Printf("タスク %d: 開始\n", taskID)
	ticker := time.NewTicker(100 * time.Millisecond) // 定期的な処理を模倣
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done(): // ★ Context のキャンセルをチェック
			fmt.Printf("タスク %d: キャンセル検知 (%v)\n", taskID, ctx.Err())
			return ctx.Err() // キャンセル理由を返す
		case t := <-ticker.C: // ★ 通常の処理 (例: 100ms ごと)
			fmt.Printf("タスク %d: 実行中 at %v\n", taskID, t.Format("15:04:05.000"))
			// ここで実際の処理を行う
			// もしこの処理が非常に長い場合は、さらに内部で ctx.Done() をチェックすることも検討
		}
	}
}

func main() {
	// キャンセル可能な Context を作成
	ctx, cancel := context.WithCancel(context.Background())

	// Goroutine でタスクを開始
	go longRunningTask(ctx, 1)

	// 500ms 後にキャンセル
	time.Sleep(500 * time.Millisecond)
	fmt.Println("main: キャンセル実行！")
	cancel()

	// Goroutine が終了するのを少し待つ
	time.Sleep(100 * time.Millisecond)
	fmt.Println("main: 終了")
}

/* 実行結果の例 (時刻は実行時に依存):
タスク 1: 開始
タスク 1: 実行中 at 01:50:00.100
タスク 1: 実行中 at 01:50:00.200
タスク 1: 実行中 at 01:50:00.300
タスク 1: 実行中 at 01:50:00.400
タスク 1: 実行中 at 01:50:00.500
main: キャンセル実行！
タスク 1: キャンセル検知 (context canceled)
main: 終了
*/
```

## 解説
```text
`context.Context` を受け取る関数や Goroutine は、その Context がキャンセルされたかどうかを**定期的にチェック**し、キャンセルされていれば**速やかに処理を中断**する必要があります。

キャンセルを検知する基本的な方法は、`ctx.Done()` が返すチャネルを `select` 文で使うことです。この方法については、**「並行処理」**セクションの**「Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`)」** (`090_concurrency/210_using-context-in-functions-checking-done.md`) で既に説明しました。

ここでは、その基本的なパターンを再確認します。

## `select` と `ctx.Done()` によるキャンセルチェック（再確認）

*   時間のかかるループ処理や、ブロッキングする可能性のある操作を行う前に、`select` 文を使って `ctx.Done()` チャネルからの受信を試みます。
*   `case <-ctx.Done():` が実行された場合、Context がキャンセルされたことを意味します。この `case` ブロック内で、必要なクリーンアップ処理（もしあれば）を行い、関数や Goroutine から `return` します。
*   `ctx.Err()` を呼び出すことで、キャンセルの理由（`context.Canceled` または `context.DeadlineExceeded`）を取得できます。

**コード解説:**

*   `longRunningTask` は `for { select { ... } }` ループを持ちます。
*   `case <-ctx.Done():` は、`main` 関数で `cancel()` が呼び出されると実行可能になります。
*   `case t := <-ticker.C:` は、`time.Ticker` が 100ms ごとに値を送信するのを待ちます。これが通常の処理パスです。
*   `cancel()` が呼び出されると、次の `select` の評価時に `<-ctx.Done()` が選択され、Goroutine はメッセージを出力して `return` します。

長時間実行される可能性のある処理や、ブロッキングする可能性のある I/O 操作を行う Goroutine では、このように `ctx.Done()` を `select` でチェックすることで、外部からのキャンセル要求に適切に応答できるようにすることが重要です。