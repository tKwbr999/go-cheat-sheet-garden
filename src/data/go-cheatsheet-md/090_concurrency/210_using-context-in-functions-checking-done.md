## タイトル
title: Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`)

## タグ
tags: ["concurrency", "goroutine", "context", "Done", "Err", "select", "キャンセル", "タイムアウト", "デッドライン"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

// Context を受け取り、キャンセルをチェックする関数
func longRunningTask(ctx context.Context, taskID int) error {
	fmt.Printf("Task %d: 開始\n", taskID)
	for i := 0; i < 5; i++ {
		select {
		case <-ctx.Done(): // ★ Done() チャネルでキャンセルを検知
			fmt.Printf("Task %d: キャンセル (%v)\n", taskID, ctx.Err())
			return ctx.Err() // キャンセル理由を返す
		case <-time.After(200 * time.Millisecond): // 処理/待機を模倣
			fmt.Printf("Task %d: Step %d\n", taskID, i+1)
		}
	}
	fmt.Printf("Task %d: 正常終了\n", taskID)
	return nil
}

func main() {
	// タイムアウト (500ms) 付き Context を作成
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel() // ★ cancel 関数を必ず呼ぶ

	// タスク実行 (1000ms かかるはず)
	err := longRunningTask(ctxTimeout, 1)
	if err != nil {
		fmt.Printf("Main: エラー: %v\n", err) // context deadline exceeded
	}
}

```

## 解説
```text
**`context`** パッケージの主な目的は、処理の**キャンセル**や
**タイムアウト/デッドライン**のシグナルを伝達することです。
これにより不要な処理を早期中断できます。

**Context の受け渡し規約:**
Context を利用する関数は、通常、**第一引数**として
`ctx context.Context` を受け取るのが Go の慣習です。
`func DoSomething(ctx context.Context, ...) error`

**キャンセルの検知: `ctx.Done()` と `select`**
`ctx.Done()` メソッドは受信専用チャネル (`<-chan struct{}`) を返します。
このチャネルは Context が**キャンセルされるとクローズ**されます。
`select` 文でこのチャネルからの受信を待つことでキャンセルを検知できます。

```go
select {
case <-ctx.Done(): // Done() チャネルから受信を試みる
    // キャンセルされた場合の処理
    err := ctx.Err() // キャンセル理由を取得
    return err
// ... 他の case ...
}
```
*   `case <-ctx.Done():`: Context がキャンセルされると実行される。
*   **`ctx.Err() error`**: `Done()` がクローズされた**後**に呼び出すと、
    キャンセル理由 (`context.Canceled` または
    `context.DeadlineExceeded`) を返す。

コード例の `longRunningTask` 関数は `ctx context.Context` を受け取り、
ループ内の `select` で `case <-ctx.Done():` を使って
キャンセルをチェックしています。キャンセルされていれば、
`ctx.Err()` を返して関数を終了します。

`main` 関数では `context.WithTimeout` で 500ms のタイムアウト付き
Context を作成し、`longRunningTask` に渡しています。
タスクは 1000ms かかるため、途中でタイムアウトが発生し、
`longRunningTask` 内の `ctx.Done()` が検知され、
`context.deadlineExceeded` エラーが返されます。

**(明示的キャンセル)** `context.WithCancel` で作成した Context の場合は、
返された `cancel()` 関数を呼び出すことで、`ctx.Done()` が検知され、
`context.Canceled` エラーが返されます。

時間のかかる処理やブロック可能性のある処理には `context.Context` を渡し、
内部で `ctx.Done()` をチェックすることで、キャンセル要求に
適切に対応でき、リソース効率の良いアプリ構築に繋がります。