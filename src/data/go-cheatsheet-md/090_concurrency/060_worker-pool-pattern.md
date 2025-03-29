## タイトル
title: ワーカープール (Worker Pool) パターン

## タグ
tags: ["concurrency", "goroutine", "channel", "worker pool", "並行処理パターン", "sync", "WaitGroup"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// ワーカー: jobs から受信し、処理して results へ送信
func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done() // 完了を通知
	for job := range jobs { // jobs が close されるまで受信
		fmt.Printf("Worker %d: Job %d 開始\n", id, job)
		time.Sleep(100 * time.Millisecond) // 処理シミュレート
		result := job * 2
		fmt.Printf("Worker %d: Job %d 完了, Result %d\n", id, job, result)
		results <- result // 結果を送信
	}
	fmt.Printf("Worker %d: 終了\n", id)
}

func main() {
	const numJobs = 5
	const numWorkers = 3

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	// ワーカー Goroutine 起動
	fmt.Printf("%d ワーカー起動...\n", numWorkers)
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// ジョブ送信
	fmt.Printf("%d ジョブ送信...\n", numJobs)
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs) // ★ 全ジョブ送信後、jobs をクローズ
	fmt.Println("全ジョブ送信完了、jobs クローズ")

	// 全ワーカーの終了待機
	fmt.Println("ワーカー終了待機...")
	wg.Wait()
	fmt.Println("全ワーカー終了")

	// ★ 全ワーカー終了後、results をクローズ
	close(results)

	// 結果収集
	fmt.Println("結果収集...")
	total := 0
	for result := range results { // results が close されるまで受信
		fmt.Printf("結果受信: %d\n", result)
		total += result
	}
	fmt.Printf("結果合計: %d\n", total)
}
```

## 解説
```text
**ワーカープール (Worker Pool)** は、多数のタスクを
限られた数の **ワーカー Goroutine** で効率的に
並行処理するパターンです。Goroutine の過剰起動を防ぎます。

**構成要素:**
1.  **ジョブチャネル (`jobs`):** 処理タスクを送信するチャネル。
2.  **ワーカー Goroutine (`worker`):** `jobs` からタスクを受信し処理。
    プールサイズ分の複数起動。
3.  **結果チャネル (`results`):** (オプション) 処理結果を送信。
4.  **ディスパッチャ:** `jobs` にタスクを投入 (例: `main`)。
5.  **コレクター:** (オプション) `results` から結果を収集 (例: `main`)。

**同期:**
*   ワーカーは `for job := range jobs` で受信。
    `jobs` が `close` されるとループ終了。
*   ディスパッチャは全タスク送信後 `close(jobs)` する。
*   全ワーカーの終了を `sync.WaitGroup` で待つ。
*   (結果収集する場合) 全ワーカー終了後 `close(results)` する。

コード例では、`numJobs` 個の数値を `numWorkers` 個の
`worker` Goroutine で2倍にする処理をしています。
1. `jobs`, `results` チャネルと `WaitGroup` を準備。
2. `worker` Goroutine を `numWorkers` 個起動 (`wg.Add(1)`)。
   各 `worker` は `jobs` から受信し、結果を `results` に送信後、
   `defer wg.Done()` で完了通知。
3. `main` が `jobs` に全ジョブを送信後、`close(jobs)`。
4. `wg.Wait()` で全 `worker` の終了を待つ。
5. `close(results)`。
6. `for result := range results` で全結果を収集。

ワーカープールはCPU/IOバウンドなタスクの効率的な
並行処理に有効な基本パターンです。