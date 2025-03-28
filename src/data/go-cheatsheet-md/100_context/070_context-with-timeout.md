---
title: "Context パッケージ: タイムアウト付き Context (`WithTimeout`)"
tags: ["context", "concurrency", "WithTimeout", "cancel", "タイムアウト", "デッドライン"]
---

処理に時間制限を設けたい場合、`context` パッケージの **`context.WithTimeout`** 関数を使います。これは、指定した時間が経過すると自動的にキャンセルされる Context を生成します。

`WithTimeout` の使い方や、キャンセルを検知する方法については、**「並行処理」**セクションの以下の項目で既に説明しました。

*   **「Context の生成 (`context` パッケージ)」** (`090_concurrency/190_creating-contexts.md`)
*   **「Context を使ったキャンセル処理 (`ctx.Done()`, `ctx.Err()`)」** (`090_concurrency/210_using-context-in-functions-checking-done.md`)

ここでは、その基本的な使い方を再確認します。

## `context.WithTimeout` の基本（再確認）

*   **`context.WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)`**:
    *   親 Context (`parent`) とタイムアウト期間 (`timeout`) を受け取り、新しい子 Context (`ctx`) と、それを（タイムアウト前でも）キャンセルできる関数 (`cancel`) を返します。
    *   指定した `timeout` が経過すると、`ctx` とその子孫 Context の `Done()` チャネルが自動的にクローズされ、`Err()` は `context.DeadlineExceeded` を返すようになります。
*   **`defer cancel()`**: タイムアウトした場合でも、関連リソースを解放するために、返された `cancel` 関数は**必ず呼び出す**必要があります。`defer` を使うのが定石です。

```go title="WithTimeout の基本的な使い方"
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
	case <-ctx.Done(): // ★ Context のキャンセル (タイムアウト含む) を検知
		fmt.Printf("作業キャンセル: %v\n", ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// --- タイムアウトするケース ---
	fmt.Println("--- タイムアウトするケース (処理 1s > タイムアウト 500ms) ---")
	// 500ms でタイムアウトする Context を作成
	ctx1, cancel1 := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel1() // defer で cancel を呼ぶ

	err1 := simulateWork(ctx1, 1*time.Second) // 1秒かかる処理を実行
	if err1 != nil {
		// ctx.Err() は context.DeadlineExceeded を返すはず
		fmt.Printf("エラー: %v\n", err1)
	}

	// --- タイムアウトしないケース ---
	fmt.Println("\n--- タイムアウトしないケース (処理 100ms < タイムアウト 500ms) ---")
	ctx2, cancel2 := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel2()

	err2 := simulateWork(ctx2, 100*time.Millisecond) // 100ms で終わる処理を実行
	if err2 != nil {
		fmt.Printf("エラー: %v\n", err2)
	} else {
		fmt.Println("正常に完了")
	}
}

/* 実行結果:
--- タイムアウトするケース (処理 1s > タイムアウト 500ms) ---
作業開始 (最大 1s)
作業キャンセル: context deadline exceeded
エラー: context deadline exceeded

--- タイムアウトしないケース (処理 100ms < タイムアウト 500ms) ---
作業開始 (最大 100ms)
作業完了
正常に完了
*/
```

**コード解説:**

*   `ctx1, cancel1 := context.WithTimeout(..., 500*time.Millisecond)`: 500ミリ秒後に自動的にキャンセルされる Context `ctx1` を作成します。
*   `simulateWork(ctx1, 1*time.Second)`: `ctx1` を使って1秒かかる処理を実行しようとします。
*   `simulateWork` 内の `select` では、`time.After(1*time.Second)` が完了する前に `ctx1.Done()` がクローズされるため（500ms経過時）、`case <-ctx.Done():` が実行され、`context.DeadlineExceeded` エラーが返されます。
*   2番目のケースでは、タイムアウト (500ms) より先に処理 (100ms) が完了するため、`case <-time.After(duration):` が実行され、エラーなく完了します。

`context.WithTimeout` は、外部API呼び出しやデータベースクエリなど、応答時間に上限を設けたい場合に非常に便利です。