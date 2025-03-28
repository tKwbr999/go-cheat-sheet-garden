---
title: "Context パッケージ: デッドライン付き Context (`WithDeadline`)"
tags: ["context", "concurrency", "WithDeadline", "cancel", "タイムアウト", "デッドライン"]
---

`context.WithTimeout` が現在時刻からの相対的な時間でタイムアウトを指定するのに対し、**`context.WithDeadline`** 関数は、**絶対的な時刻（デッドライン）**を指定して、その時刻になると自動的にキャンセルされる Context を生成します。

`WithDeadline` の使い方や、キャンセルを検知する方法は `WithTimeout` と非常に似ています。これらについては、**「並行処理」**セクションの以下の項目で既に説明しました。

*   **「Context の生成 (`context` パッケージ)」** (`090_concurrency/190_creating-contexts.md`)
*   **「Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`)」** (`090_concurrency/210_using-context-in-functions-checking-done.md`)

ここでは、その基本的な使い方を再確認します。

## `context.WithDeadline` の基本（再確認）

*   **`context.WithDeadline(parent Context, d time.Time) (Context, CancelFunc)`**:
    *   親 Context (`parent`) とデッドラインとなる絶対時刻 (`d`) を受け取り、新しい子 Context (`ctx`) と、それを（デッドライン前でも）キャンセルできる関数 (`cancel`) を返します。
    *   指定した時刻 `d` になると、`ctx` とその子孫 Context の `Done()` チャネルが自動的にクローズされ、`Err()` は `context.DeadlineExceeded` を返すようになります。
*   **`defer cancel()`**: デッドラインを過ぎた場合でも、関連リソースを解放するために、返された `cancel` 関数は**必ず呼び出す**必要があります。`defer` を使うのが定石です。

**`WithTimeout` との関係:**
`context.WithTimeout(parent, timeout)` は、内部的には `context.WithDeadline(parent, time.Now().Add(timeout))` を呼び出すのと同じです。つまり、`WithTimeout` は `WithDeadline` の便利なラッパー関数と言えます。

## コード例

```go title="WithDeadline の基本的な使い方"
package main

import (
	"context"
	"fmt"
	"time"
)

// 時間のかかる処理 (Context をチェック)
func simulateWork(ctx context.Context, duration time.Duration) error {
	fmt.Printf("作業開始 (最大 %v)\n", duration)
	select {
	case <-time.After(duration): // 指定された時間、処理を模倣
		fmt.Println("作業完了")
		return nil
	case <-ctx.Done(): // ★ Context のキャンセル (デッドライン超過含む) を検知
		fmt.Printf("作業キャンセル: %v\n", ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// --- デッドライン超過ケース ---
	fmt.Println("--- デッドライン超過ケース (処理 1s > デッドライン 500ms後) ---")
	// 500ms 後をデッドラインとして設定
	deadline1 := time.Now().Add(500 * time.Millisecond)
	ctx1, cancel1 := context.WithDeadline(context.Background(), deadline1)
	defer cancel1() // defer で cancel を呼ぶ

	err1 := simulateWork(ctx1, 1*time.Second) // 1秒かかる処理を実行
	if err1 != nil {
		// ctx.Err() は context.DeadlineExceeded を返すはず
		fmt.Printf("エラー: %v\n", err1)
	}

	// --- 間に合うケース ---
	fmt.Println("\n--- 間に合うケース (処理 100ms < デッドライン 500ms後) ---")
	deadline2 := time.Now().Add(500 * time.Millisecond)
	ctx2, cancel2 := context.WithDeadline(context.Background(), deadline2)
	defer cancel2()

	err2 := simulateWork(ctx2, 100*time.Millisecond) // 100ms で終わる処理を実行
	if err2 != nil {
		fmt.Printf("エラー: %v\n", err2)
	} else {
		fmt.Println("正常に完了")
	}
}

/* 実行結果:
--- デッドライン超過ケース (処理 1s > デッドライン 500ms後) ---
作業開始 (最大 1s)
作業キャンセル: context deadline exceeded
エラー: context deadline exceeded

--- 間に合うケース (処理 100ms < デッドライン 500ms後) ---
作業開始 (最大 100ms)
作業完了
正常に完了
*/
```

**コード解説:**

*   `deadline1 := time.Now().Add(500 * time.Millisecond)`: 現在時刻から500ミリ秒後をデッドラインとして `time.Time` 型で計算します。
*   `ctx1, cancel1 := context.WithDeadline(..., deadline1)`: `deadline1` をデッドラインとする Context `ctx1` を作成します。
*   `simulateWork(ctx1, 1*time.Second)`: `ctx1` を使って1秒かかる処理を実行しようとします。
*   `simulateWork` 内の `select` では、処理完了 (1秒後) より先にデッドライン (500ms後) を迎えるため、`ctx1.Done()` がクローズされ、`case <-ctx.Done():` が実行され、`context.DeadlineExceeded` エラーが返されます。
*   2番目のケースでは、デッドライン (500ms後) より先に処理 (100ms) が完了するため、`case <-time.After(duration):` が実行され、エラーなく完了します。

`context.WithDeadline` は、特定の絶対時刻までに処理を完了させたい場合に便利です。例えば、外部システムとの連携で「今日の午後5時までに処理が終わらなければ中断する」といったシナリオで使えます。相対的な時間で十分な場合は `context.WithTimeout` を使う方が一般的です。