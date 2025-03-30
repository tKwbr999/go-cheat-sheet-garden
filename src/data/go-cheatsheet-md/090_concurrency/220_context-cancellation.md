## タイトル
title: Context による明示的なキャンセル

## タグ
tags: ["concurrency", "goroutine", "context", "WithCancel", "cancel", "キャンセル", "伝播"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// キャンセルされるまで作業するワーカー
func worker(ctx context.Context, id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d: 開始\n", id)
	for {
		select {
		case <-ctx.Done(): // ★ キャンセルを検知
			fmt.Printf("Worker %d: キャンセル (%v)\n", id, ctx.Err())
			return
		case <-time.After(150 * time.Millisecond): // 作業模倣
			fmt.Printf("Worker %d: 動作中...\n", id)
		}
	}
}

func main() {
	var wg sync.WaitGroup

	// キャンセル可能なルート Context と cancel 関数を作成
	ctx, cancelAll := context.WithCancel(context.Background())
	defer cancelAll() // ★ main 終了時に必ず cancel を呼ぶ

	numWorkers := 2
	wg.Add(numWorkers)
	for i := 1; i <= numWorkers; i++ {
		go worker(ctx, i, &wg) // 同じ ctx を渡す
	}

	time.Sleep(400 * time.Millisecond) // しばらく実行

	fmt.Println("\nMain: キャンセル実行 (cancelAll)")
	cancelAll() // ★ これで全ワーカーにキャンセルが伝播

	wg.Wait() // 全ワーカーの終了を待つ
	fmt.Println("Main: 全ワーカー終了")
}

```

## 解説
```text
`context.WithCancel` は、処理を**明示的にキャンセル**する
機能を提供します。

**`context.WithCancel()`:**
`ctx, cancel := context.WithCancel(parentCtx)`
*   キャンセル可能な子 Context `ctx` と、
    それをキャンセルするための関数 `cancel` (`CancelFunc` 型) を返す。

**`cancel()` 関数の効果:**
`cancel()` を呼び出すと、
1. `ctx` の `Done()` チャネルがクローズされる。
2. `ctx` から派生した**すべての子孫 Context** の `Done()` も
   再帰的にクローズされる (キャンセルの伝播)。
3. `ctx` と子孫の `Err()` は `context.Canceled` を返すようになる。

**重要:** `WithCancel` (や `WithTimeout`, `WithDeadline`) で
Context を生成したら、関連処理完了後に**必ず `cancel()` を呼ぶ**
必要があります (通常 `defer cancel()`)。これによりリソースが解放されます。

コード例:
1. `context.WithCancel` でルート `ctx` と `cancelAll` を作成。
2. 複数の `worker` Goroutine に同じ `ctx` を渡して起動。
3. 各 `worker` は `select` で `<-ctx.Done()` を監視。
4. `main` が `cancelAll()` を呼び出す。
5. `ctx` の `Done()` がクローズされ、全 `worker` の `select` が
   `<-ctx.Done()` ケースを実行し、キャンセル処理を行って終了する。
6. `main` は `wg.Wait()` で全 `worker` の終了を待つ。

`context.WithCancel` は、複数の Goroutine にまたがる処理を
一括して安全にキャンセルしたい場合に非常に役立ちます
(サーバーシャットダウン、ユーザー操作による中断など)。