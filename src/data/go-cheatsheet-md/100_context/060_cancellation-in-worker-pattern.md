## タイトル
title: ワーカーパターンにおけるキャンセル

## タグ
tags: ["context", "concurrency", "goroutine", "worker pool", "select", "Done", "キャンセル"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Task int
type Result int

// ワーカー: Context を受け取り、キャンセルを監視
func worker(ctx context.Context, id int, tasks <-chan Task, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d: Start\n", id)
	for {
		select {
		case task, ok := <-tasks:
			if !ok { return } // タスクチャネル close
			fmt.Printf("Worker %d: Task %d Process...\n", id, task)
			time.Sleep(100 * time.Millisecond) // 処理模倣
			results <- Result(task * 10)
		case <-ctx.Done(): // ★ キャンセル検知
			fmt.Printf("Worker %d: Cancelled (%v)\n", id, ctx.Err())
			return
		}
	}
}

func main() {
	tasks := make(chan Task, 5)
	results := make(chan Result, 5)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // main 終了時にキャンセル
	var wg sync.WaitGroup

	// ワーカー起動
	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(ctx, w, tasks, results, &wg) // ctx を渡す
	}

	// タスク送信
	for j := 1; j <= 5; j++ { tasks <- Task(j) }
	close(tasks) // タスク送信完了 -> ワーカーはタスクを終えたら終了できる

	// 途中でキャンセルする場合 (例)
	// time.Sleep(150 * time.Millisecond)
	// fmt.Println(">>> Cancelling...")
	// cancel() // これで全ワーカーにキャンセルが伝播

	wg.Wait() // 全ワーカー終了待機
	close(results) // 結果チャネルをクローズ
	fmt.Println("All workers done.")
	// 結果収集 (省略)
	// for res := range results { fmt.Println("Result:", res) }
}
```

## 解説
```text
ワーカープールパターンのように複数の Goroutine が動作している際、
外部からの指示でそれらを一斉に停止させたい場合に
**`context.Context`** が効果的です。

**ワーカー関数での Context 利用パターン:**
1. ワーカー関数は第一引数として `ctx context.Context` を受け取る。
2. メインループ内で `select` 文を使い、タスクチャネルからの受信と
   **`ctx.Done()` チャネルからの受信**を同時に待つ。
3. `case <-ctx.Done():` が実行されたら、Context がキャンセルされた
   ことを意味するので、必要なクリーンアップを行い `return` して
   Goroutine を終了する。

コード例:
*   `worker` 関数は `ctx` を受け取り、`select` で `tasks` と `ctx.Done()` を監視。
*   `main` 関数で `context.WithCancel` を使い `ctx` と `cancel` を生成。
*   各 `worker` Goroutine に同じ `ctx` を渡して起動。
*   (コメントアウト部分のように) `cancel()` を呼び出すと、
    `ctx` の `Done()` チャネルがクローズされ、それが全 `worker` に伝播。
*   各 `worker` は `case <-ctx.Done():` を検知し、処理を中断して終了する。
*   `main` は `wg.Wait()` で全ワーカーの終了を待つ。

このように Context をワーカーパターンに組み込むことで、
実行中のワーカー群に対して外部から安全かつ効率的に
キャンセルを通知できます。