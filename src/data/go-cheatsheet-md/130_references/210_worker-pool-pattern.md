## タイトル
title: "デザインパターン: ワーカープールパターン (Worker Pool)"
## タグ
tags: ["references", "design pattern", "concurrency", "goroutine", "channel", "worker pool"]
ワーカープールは、Goで並行処理を実装する際の一般的なデザインパターンの一つです。限られた数のワーカー Goroutine を使って、多数のタスク（ジョブ）を効率的に処理します。

ワーカープールの詳細な説明と実装例については、**「並行処理」**セクションの**「ワーカープール (Worker Pool) パターン」** (`090_concurrency/060_worker-pool-pattern.md`) を参照してください。

## 基本的な構造（再確認）

1.  **ジョブチャネル:** 処理すべきタスクを投入するチャネル。
2.  **ワーカー Goroutine:** ジョブチャネルからタスクを受け取り、処理を実行する Goroutine。複数起動される。
3.  **結果チャネル (オプション):** 処理結果をワーカーから受け取るためのチャネル。
4.  **ディスパッチャ:** ジョブチャネルにタスクを送信し、最後にチャネルを `close` する。
5.  **コレクター (オプション):** 結果チャネルから結果を収集する。
6.  **同期:** `sync.WaitGroup` などを使って、すべてのワーカーの終了を待つ。

## コード例 (再掲)

```go title="ワーカープールパターンの基本構造"
package main

import (
	"fmt"
	"sync"
	"time"
)

// ダミーのジョブと結果
type Job int
type Result int

// ワーカー関数
func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs { // jobs が close されるまで受信
		fmt.Printf("ワーカー %d: ジョブ %d 開始\n", id, job)
		time.Sleep(100 * time.Millisecond) // 処理をシミュレート
		results <- Result(job * 2)         // 結果を送信
		fmt.Printf("ワーカー %d: ジョブ %d 完了\n", id, job)
	}
	fmt.Printf("ワーカー %d: 終了\n", id)
}

func main() {
	const numJobs = 5
	const numWorkers = 2

	jobs := make(chan Job, numJobs)
	results := make(chan Result, numJobs)
	var wg sync.WaitGroup

	// ワーカーを起動
	fmt.Printf("%d 個のワーカーを起動\n", numWorkers)
	wg.Add(numWorkers)
	for w := 1; w <= numWorkers; w++ {
		go worker(w, jobs, results, &wg)
	}

	// ジョブを送信
	fmt.Printf("%d 個のジョブを送信\n", numJobs)
	for j := 1; j <= numJobs; j++ {
		jobs <- Job(j)
	}
	close(jobs) // ★ ジョブ送信完了後、jobs チャネルをクローズ

	// すべてのワーカーの終了を待つ
	fmt.Println("ワーカーの終了を待機...")
	wg.Wait()
	fmt.Println("すべてのワーカーが終了")

	// 結果を収集 (結果チャネルもクローズするのが安全)
	close(results) // ★ ワーカー終了後に results チャネルをクローズ
	fmt.Println("結果を収集:")
	for result := range results {
		fmt.Printf("結果受信: %d\n", result)
	}
	fmt.Println("収集完了")
}

/* 実行結果の例:
2 個のワーカーを起動
5 個のジョブを送信
ワーカーの終了を待機...
ワーカー 1: ジョブ 1 開始
ワーカー 2: ジョブ 2 開始
ワーカー 1: ジョブ 1 完了
ワーカー 1: ジョブ 3 開始
ワーカー 2: ジョブ 2 完了
ワーカー 2: ジョブ 4 開始
ワーカー 1: ジョブ 3 完了
ワーカー 1: ジョブ 5 開始
ワーカー 2: ジョブ 4 完了
ワーカー 2: 終了
ワーカー 1: ジョブ 5 完了
ワーカー 1: 終了
すべてのワーカーが終了
結果を収集:
結果受信: 2
結果受信: 4
結果受信: 6
結果受信: 8
結果受信: 10
収集完了
*/
```

ワーカープールパターンは、並行処理の数を制御し、リソースを効率的に利用するための重要なテクニックです。