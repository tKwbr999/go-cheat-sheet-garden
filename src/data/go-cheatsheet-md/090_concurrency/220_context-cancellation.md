---
title: "並行処理: Context による明示的なキャンセル"
tags: ["concurrency", "goroutine", "context", "WithCancel", "cancel", "キャンセル", "伝播"]
---

`context.WithCancel` 関数は、キャンセル可能な Context を生成すると同時に、その Context をキャンセルするための関数（`CancelFunc` 型）を返します。この `cancel` 関数を呼び出すことで、関連する Goroutine に処理の中断を明示的に要求できます。

## `cancel()` 関数の呼び出しと効果

*   **`context.WithCancel(parent)`** は `(ctx Context, cancel CancelFunc)` を返します。
*   返された **`cancel()`** 関数を呼び出すと、以下のことが起こります。
    1.  生成された子 Context `ctx` の `Done()` チャネルが**クローズ**されます。
    2.  `ctx` から派生して作成された**すべての子孫 Context** の `Done()` チャネルも**再帰的にクローズ**されます。
    3.  `ctx` およびその子孫 Context の `Err()` メソッドは、`context.Canceled` エラーを返すようになります。
*   `cancel()` 関数は**何度呼び出しても安全**です（最初の呼び出しのみが効果を持ちます）。
*   **重要:** `WithCancel`, `WithTimeout`, `WithDeadline` で生成された Context を使い終わったら、関連するリソースを解放するために、**必ず `cancel()` 関数を呼び出す**必要があります。通常は **`defer cancel()`** を使います。

## キャンセルの伝播

`cancel()` が呼び出されると、その Context から派生したすべての子孫 Context にキャンセルが伝播する、という点が重要です。これにより、一連の処理（例えば、リクエスト処理に関わる複数の Goroutine）をまとめてキャンセルすることができます。

## コード例: 複数のワーカーのキャンセル

複数のワーカー Goroutine を起動し、外部からの指示でそれらすべてを一度にキャンセルさせる例を見てみましょう。

```go title="複数の Goroutine を Context でキャンセル"
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// キャンセルされるまで作業を続けるワーカー
func worker(ctx context.Context, id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("ワーカー %d: 開始\n", id)
	count := 0
	for {
		count++
		select {
		case <-ctx.Done(): // ★ 親 Context からのキャンセルを検知
			fmt.Printf("ワーカー %d: キャンセルされました (理由: %v)。ループ %d 回で終了。\n", id, ctx.Err(), count)
			return // Goroutine を終了
		case <-time.After(150 * time.Millisecond): // ★ 何らかの作業を模倣
			fmt.Printf("ワーカー %d: 動作中 (%d)...\n", id, count)
			// ここでさらに子 Context を生成して別の処理を呼び出すこともできる
			// 例: childCtx, childCancel := context.WithTimeout(ctx, 50*time.Millisecond)
			//    callSubTask(childCtx)
			//    childCancel()
			// 親 ctx がキャンセルされれば、childCtx もキャンセルされる
		}
	}
}

func main() {
	var wg sync.WaitGroup

	// キャンセル可能なルート Context を作成
	// この ctx から派生したすべての Context は、cancelAll() でキャンセルされる
	ctx, cancelAll := context.WithCancel(context.Background())
	// ★ defer で cancelAll を呼び出し、main 関数終了時に確実にキャンセルされるようにする
	defer cancelAll()

	numWorkers := 3
	fmt.Printf("%d 個のワーカーを起動します...\n", numWorkers)

	wg.Add(numWorkers)
	for i := 1; i <= numWorkers; i++ {
		// 各ワーカーに同じ ctx を渡す
		go worker(ctx, i, &wg)
	}

	// しばらくワーカーを実行させる
	fmt.Println("メイン: 500ms 待機します...")
	time.Sleep(500 * time.Millisecond)

	// --- すべてのワーカーをキャンセル ---
	fmt.Println("\nメイン: すべてのワーカーをキャンセルします！ (cancelAll() 呼び出し)")
	cancelAll() // ★ これにより、すべてのワーカーの ctx.Done() がクローズされる

	// すべてのワーカーが終了するのを待つ
	fmt.Println("メイン: すべてのワーカーの終了を待機します...")
	wg.Wait()

	fmt.Println("メイン: すべてのワーカーが終了しました。")
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
3 個のワーカーを起動します...
ワーカー 1: 開始
ワーカー 2: 開始
ワーカー 3: 開始
メイン: 500ms 待機します...
ワーカー 1: 動作中 (1)...
ワーカー 2: 動作中 (1)...
ワーカー 3: 動作中 (1)...
ワーカー 1: 動作中 (2)...
ワーカー 2: 動作中 (2)...
ワーカー 3: 動作中 (2)...
ワーカー 1: 動作中 (3)...
ワーカー 2: 動作中 (3)...
ワーカー 3: 動作中 (3)...

メイン: すべてのワーカーをキャンセルします！ (cancelAll() 呼び出し)
メイン: すべてのワーカーの終了を待機します...
ワーカー 1: キャンセルされました (理由: context canceled)。ループ 4 回で終了。
ワーカー 2: キャンセルされました (理由: context canceled)。ループ 4 回で終了。
ワーカー 3: キャンセルされました (理由: context canceled)。ループ 4 回で終了。
メイン: すべてのワーカーが終了しました。
*/
```

**コード解説:**

*   `ctx, cancelAll := context.WithCancel(context.Background())`: キャンセル可能なルート Context `ctx` と、それをキャンセルするための関数 `cancelAll` を作成します。
*   `defer cancelAll()`: `main` 関数が終了する際に `cancelAll` が呼ばれるように `defer` します。これは、たとえ正常に処理が完了した場合でも、Context に関連するリソースを解放するために重要です。
*   `go worker(ctx, i, &wg)`: 起動するすべての `worker` Goroutine に、同じ Context `ctx` を渡します。
*   `worker` 関数内の `select { case <-ctx.Done(): ... }`: 各ワーカーはループのたびに `ctx.Done()` をチェックします。
*   `time.Sleep(500 * time.Millisecond)`: `main` 関数は少し待機します。
*   `cancelAll()`: `main` 関数がこの関数を呼び出すと、`ctx` の `Done()` チャネルがクローズされます。
*   `worker` 内の `select` は `case <-ctx.Done():` を検知し、各ワーカーはキャンセル処理を実行して `return` します。
*   `wg.Wait()`: `main` 関数は、すべてのワーカーが `Done()` を呼び出して終了するのを待ちます。

`context.WithCancel` と `cancel()` 関数を使うことで、複数の Goroutine にまたがる処理を一括して安全にキャンセルすることができます。これは、サーバーがシャットダウンする際や、ユーザーが操作を中断した場合などに非常に役立ちます。