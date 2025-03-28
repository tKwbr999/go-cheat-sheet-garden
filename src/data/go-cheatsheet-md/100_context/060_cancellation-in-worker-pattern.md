---
title: "Context パッケージ: ワーカーパターンにおけるキャンセル"
tags: ["context", "concurrency", "goroutine", "worker pool", "select", "Done", "キャンセル"]
---

ワーカープールパターン（`090_concurrency/060_worker-pool-pattern.md` 参照）のように、複数のワーカー Goroutine がチャネルからタスクを受け取って処理する場合、外部からの指示でこれらのワーカーを一斉に、または個別に停止させたいことがあります。このような場合に `context.Context` を使うのが効果的です。

## ワーカー関数での Context 利用パターン

ワーカー関数は、通常のタスク（ジョブ）チャネルに加えて、第一引数として `context.Context` を受け取るようにします。そして、メインの処理ループ内で `select` 文を使い、タスクチャネルからの受信と `ctx.Done()` チャネルからの受信を同時に待ち受けます。

```go
func worker(ctx context.Context, id int, tasks <-chan Task, results chan<- Result) {
	defer fmt.Printf("ワーカー %d: 終了\n", id) // 終了時にメッセージ表示 (例)
	for {
		select {
		case task, ok := <-tasks: // タスクチャネルから受信
			if !ok {
				// tasks チャネルがクローズされた場合 (もうタスクは来ない)
				fmt.Printf("ワーカー %d: タスクチャネルが閉じられたため終了します。\n", id)
				return // Goroutine を終了
			}
			// タスクを処理
			fmt.Printf("ワーカー %d: タスク '%v' を処理中...\n", id, task)
			// ★ 処理中にさらにキャンセルをチェックすることも可能 ★
			// result, err := processTask(ctx, task)
			result := processTask(task) // 簡単のため ctx は渡さない例
			// if err != nil { ... }

			// 結果を送信 (ここでもキャンセルをチェックできる)
			select {
			case results <- result:
				fmt.Printf("ワーカー %d: タスク '%v' の結果 '%v' を送信しました。\n", id, task, result)
			case <-ctx.Done(): // ★ 結果送信前にキャンセルされた場合
				fmt.Printf("ワーカー %d: 結果送信前にキャンセルされました (%v)。\n", id, ctx.Err())
				return // Goroutine を終了
			}

		case <-ctx.Done(): // ★ Context がキャンセルされた場合
			fmt.Printf("ワーカー %d: キャンセルシグナル受信 (%v)。終了します。\n", id, ctx.Err())
			return // Goroutine を終了
		}
	}
}

// ダミーのタスク型と結果型
type Task int
type Result int

// ダミーのタスク処理関数
func processTask(task Task) Result {
	time.Sleep(time.Duration(task) * 50 * time.Millisecond) // 処理時間を模倣
	return Result(task * 10)
}
```

**ポイント:**

*   `select` 文により、ワーカーはタスクチャネル (`tasks`) とキャンセルチャネル (`ctx.Done()`) の**両方を同時に監視**します。
*   タスクが来ていればタスクを処理します。
*   タスクが来ていなくても、もし Context がキャンセルされれば、`case <-ctx.Done():` が実行され、ワーカーは速やかに終了します。これにより、タスクチャネルでブロックしている状態でもキャンセルに応答できます。
*   タスクチャネルがクローズされた場合も、`case task, ok := <-tasks:` の `ok` が `false` になるため、これを検知してワーカーを正常に終了させることができます。
*   タスクの処理自体が長い場合や、結果の送信がブロックする可能性がある場合は、その部分でも `select` を使って `ctx.Done()` をチェックすることが推奨されます。

## コード例: キャンセル可能なワーカープール

```go title="Context でキャンセル可能なワーカープール"
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// (上記の worker, Task, Result, processTask 関数定義は省略)

func main() {
	const numJobs = 10
	const numWorkers = 3

	tasks := make(chan Task, numJobs)
	results := make(chan Result, numJobs) // 結果は捨てるがチャネルは用意

	// キャンセル可能な Context を作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // main 終了時に確実にキャンセル

	var wg sync.WaitGroup

	fmt.Printf("%d 個のワーカーを起動します...\n", numWorkers)
	// --- ワーカー Goroutine の起動 ---
	wg.Add(numWorkers)
	for w := 1; w <= numWorkers; w++ {
		// ★ 各ワーカーに ctx を渡す ★
		go func(workerID int) {
			defer wg.Done()
			worker(ctx, workerID, tasks, results)
		}(w)
	}

	fmt.Printf("%d 個のタスクを送信します...\n", numJobs)
	// --- タスクの送信 ---
	for j := 1; j <= numJobs; j++ {
		tasks <- Task(j)
	}
	// ★ タスク送信完了後、タスクチャネルをクローズ ★
	// これにより、すべてのタスクが終わった後、ワーカーが正常終了できる
	close(tasks)
	fmt.Println("すべてのタスクを送信し、タスクチャネルをクローズしました。")

	// --- 途中でキャンセルする場合 (例) ---
	go func() {
		time.Sleep(200 * time.Millisecond) // 200ms 後にキャンセル
		fmt.Println("\n>>> キャンセル実行！ <<<\n")
		cancel() // ★ cancel() を呼び出すと、すべてのワーカーの ctx.Done() がクローズされる
	}()

	// --- ワーカーの終了待機 ---
	fmt.Println("すべてのワーカーの完了を待機します...")
	wg.Wait()
	fmt.Println("すべてのワーカーが完了しました。")

	// 結果チャネルに残っているかもしれない結果を読み捨てる (今回は使わないので)
	close(results)
	for range results {
	}
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
3 個のワーカーを起動します...
10 個のタスクを送信します...
すべてのタスクを送信し、タスクチャネルをクローズしました。
すべてのワーカーの完了を待機します...
ワーカー 1: タスク '1' を処理中...
ワーカー 2: タスク '2' を処理中...
ワーカー 3: タスク '3' を処理中...
ワーカー 1: タスク '1' の結果 '10' を送信しました。
ワーカー 1: タスク '4' を処理中...
ワーカー 2: タスク '2' の結果 '20' を送信しました。
ワーカー 2: タスク '5' を処理中...
ワーカー 3: タスク '3' の結果 '30' を送信しました。
ワーカー 3: タスク '6' を処理中...
ワーカー 1: タスク '4' の結果 '40' を送信しました。
ワーカー 1: タスク '7' を処理中...

>>> キャンセル実行！ <<<

ワーカー 2: キャンセルシグナル受信 (context canceled)。終了します。
ワーカー 3: キャンセルシグナル受信 (context canceled)。終了します。
ワーカー 1: キャンセルシグナル受信 (context canceled)。終了します。
すべてのワーカーが完了しました。
*/
```

**コード解説:**

*   `main` 関数で `context.WithCancel` を使って `ctx` と `cancel` を生成します。
*   起動される各 `worker` Goroutine に同じ `ctx` を渡します。
*   `main` 関数はタスクを送信し、`tasks` チャネルをクローズします。
*   別の Goroutine が 200ms 後に `cancel()` を呼び出します。
*   `worker` 内の `select` は `case <-ctx.Done():` を検知し、各ワーカーは処理を中断して終了します。
*   `wg.Wait()` は、すべてのワーカーが `Done()` を呼び出して終了するのを待ちます。

このように Context をワーカーパターンに組み込むことで、実行中のワーカーに対して外部から安全かつ効率的にキャンセルを通知することができます。