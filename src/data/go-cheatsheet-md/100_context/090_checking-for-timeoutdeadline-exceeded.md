---
title: "Context パッケージ: タイムアウト/デッドライン超過の確認"
tags: ["context", "concurrency", "Err", "DeadlineExceeded", "Canceled", "errors.Is", "タイムアウト", "デッドライン"]
---

`context.Context` がキャンセルされた際、その理由がタイムアウトやデッドラインの超過によるものなのか、それとも `cancel()` 関数が明示的に呼び出されたことによるものなのかを区別したい場合があります。これは `ctx.Err()` メソッドの戻り値を調べることで可能です。

## `ctx.Err()` の戻り値

`ctx.Done()` チャネルがクローズされた**後**に `ctx.Err()` を呼び出すと、以下のいずれかの定義済みエラー値が返されます。

*   **`context.DeadlineExceeded`**: `context.WithTimeout` または `context.WithDeadline` で設定された時間制限に達したために Context がキャンセルされた場合に返されます。
*   **`context.Canceled`**: `context.WithCancel` で生成された Context の `cancel()` 関数が呼び出されたために Context がキャンセルされた場合に返されます。（`WithTimeout` や `WithDeadline` で生成された Context でも、時間制限に達する前に `cancel()` が呼ばれた場合はこちらが返されます。）

Context がまだキャンセルされていない場合は、`ctx.Err()` は `nil` を返します。

## キャンセル理由の確認方法

`ctx.Err()` の戻り値と、`context.DeadlineExceeded` または `context.Canceled` を比較することで、キャンセルの理由を特定できます。

*   **`==` による直接比較:** `ctx.Err()` が返すのは定義済みのエラー値なので、`==` で直接比較できます。
    ```go
    if ctx.Err() == context.DeadlineExceeded {
        // タイムアウトまたはデッドライン超過の場合の処理
    } else if ctx.Err() == context.Canceled {
        // 明示的なキャンセルまたは親 Context のキャンセルの場合の処理
    }
    ```
*   **`errors.Is()` による比較:** エラーラッピング (`%w`) を使って Context のエラーをラップしている可能性がある場合は、`errors.Is()` を使う方がより堅牢です。
    ```go
    err := ctx.Err() // または Context を使う関数から返されたエラー
    if errors.Is(err, context.DeadlineExceeded) {
        // タイムアウトまたはデッドライン超過の場合の処理
    } else if errors.Is(err, context.Canceled) {
        // 明示的なキャンセルまたは親 Context のキャンセルの場合の処理
    }
    ```
    通常、`ctx.Err()` を直接チェックする場合は `==` で十分ですが、関数から返されたエラーが Context のエラーをラップしている可能性がある場合は `errors.Is` を使うのが良いでしょう。

## コード例

```go title="タイムアウトとキャンセルの理由を確認"
package main

import (
	"context"
	"errors" // errors.Is を使うため
	"fmt"
	"time"
)

// Context をチェックする関数
func checkContextStatus(ctx context.Context, name string) {
	select {
	case <-ctx.Done(): // キャンセルされるまで待機
		err := ctx.Err() // キャンセル理由を取得
		fmt.Printf("%s: キャンセルされました。理由: %v\n", name, err)

		// 理由を判定
		if err == context.DeadlineExceeded { // または errors.Is(err, context.DeadlineExceeded)
			fmt.Printf("   -> %s はタイムアウトまたはデッドライン超過です。\n", name)
		} else if err == context.Canceled { // または errors.Is(err, context.Canceled)
			fmt.Printf("   -> %s は明示的にキャンセルされました。\n", name)
		}
	case <-time.After(2 * time.Second): // 念のためタイムアウト
		fmt.Printf("%s: 2秒経過してもキャンセルされませんでした。\n", name)
	}
}

func main() {
	// --- タイムアウトケース ---
	fmt.Println("--- タイムアウトケース ---")
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancelTimeout()
	checkContextStatus(ctxTimeout, "TimeoutContext")

	// --- 明示的キャンセルケース ---
	fmt.Println("\n--- 明示的キャンセルケース ---")
	ctxCancel, cancelFunc := context.WithCancel(context.Background())
	go func() {
		time.Sleep(100 * time.Millisecond) // 100ms 後にキャンセル
		fmt.Println("   (cancelFunc() を呼び出します)")
		cancelFunc()
	}()
	checkContextStatus(ctxCancel, "CancelContext")

	// --- ラップされたエラーのケース ---
	fmt.Println("\n--- ラップされたエラーのケース ---")
	ctxTimeout2, cancelTimeout2 := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancelTimeout2()
	// simulateWork が ctxTimeout2.Err() をラップして返すとする
	wrappedErr := fmt.Errorf("処理中にエラー発生: %w", simulateWork(ctxTimeout2, 100*time.Millisecond))

	fmt.Printf("ラップされたエラー: %v\n", wrappedErr)
	// errors.Is を使ってラップされたエラーの原因を調べる
	if errors.Is(wrappedErr, context.DeadlineExceeded) {
		fmt.Println("-> ラップされたエラーの原因は DeadlineExceeded です。")
	}
}

// simulateWork 関数 (再掲)
func simulateWork(ctx context.Context, duration time.Duration) error {
	select {
	case <-time.After(duration):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

/* 実行結果:
--- タイムアウトケース ---
TimeoutContext: キャンセルされました。理由: context deadline exceeded
   -> TimeoutContext はタイムアウトまたはデッドライン超過です。

--- 明示的キャンセルケース ---
   (cancelFunc() を呼び出します)
CancelContext: キャンセルされました。理由: context canceled
   -> CancelContext は明示的にキャンセルされました。

--- ラップされたエラーのケース ---
ラップされたエラー: 処理中にエラー発生: context deadline exceeded
-> ラップされたエラーの原因は DeadlineExceeded です。
*/
```

**コード解説:**

*   `checkContextStatus` 関数は、`ctx.Done()` を待ち、キャンセルされたら `ctx.Err()` で理由を取得し、`==` を使って `context.DeadlineExceeded` か `context.Canceled` かを判定しています。
*   タイムアウトケースでは `context.DeadlineExceeded` が、明示的キャンセルケースでは `context.Canceled` が正しく判定されています。
*   ラップされたエラーのケースでは、`simulateWork` が返した `context.DeadlineExceeded` を `fmt.Errorf` の `%w` でラップしています。この `wrappedErr` に対して `errors.Is(wrappedErr, context.DeadlineExceeded)` を使うことで、ラップされていても元のエラーが `DeadlineExceeded` であることを正しく判定できています。

Context がキャンセルされた理由を知ることで、タイムアウトによるエラーなのか、他の要因によるキャンセルなのかを区別し、より適切なエラーハンドリングやログ記録を行うことができます。