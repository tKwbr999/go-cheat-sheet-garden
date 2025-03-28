---
title: "並行処理: ワーカープール (Worker Pool) パターン"
tags: ["concurrency", "goroutine", "channel", "worker pool", "並行処理パターン", "sync", "WaitGroup"]
---

Goの並行処理でよく使われるパターンの一つに**ワーカープール (Worker Pool)** があります。これは、処理すべきタスク（ジョブ）が多数ある場合に、限られた数の**ワーカー (Worker)** Goroutine を使って効率的に処理を進めるためのパターンです。

## ワーカープールパターンとは？

*   **目的:** 大量のタスクを並行に処理したいが、無制限に Goroutine を起動するとリソース（メモリ、CPU）を消費しすぎる可能性があるため、同時に実行する Goroutine の数を制限しつつ、効率的にタスクをこなす。
*   **構成要素:**
    1.  **ジョブチャネル (`jobs`):** 処理すべきタスク（ジョブ）を送信するためのチャネル。
    2.  **ワーカー Goroutine (`worker`):** 実際にタスクを処理する Goroutine。通常、複数（プールのサイズ分）起動される。各ワーカーはジョブチャネルからジョブを受信し、処理を実行する。
    3.  **結果チャネル (`results`):** ワーカーが処理した結果を送信するためのチャネル（オプション、結果が必要な場合）。
    4.  **ディスパッチャ (Dispatcher) / プロデューサー (Producer):** ジョブチャネルにタスクを投入する役割（`main` Goroutine など）。
    5.  **コレクター (Collector):** 結果チャネルから処理結果を収集する役割（`main` Goroutine など、結果が必要な場合）。
*   **同期:**
    *   ワーカーは `for range jobs` を使ってジョブチャネルからジョブを受信する。ジョブチャネルがクローズされると、ワーカーはループを終了する。
    *   すべてのジョブが送信されたら、ディスパッチャはジョブチャネルを `close` する。
    *   すべてのワーカーが終了したことを確認するために `sync.WaitGroup` を使うことが多い。

## コード例

例として、いくつかの数値（ジョブ）を受け取り、それぞれを2倍にする処理を、3つのワーカー Goroutine で並行して行うワーカープールを実装します。

```go title="ワーカープールパターンの実装例"
package main

import (
	"fmt"
	"sync" // WaitGroup を使うため
	"time"
)

// ワーカー関数: ジョブを受け取り、処理して結果を送信する
// id: ワーカーの識別子
// jobs: ジョブを受信するためのチャネル (受信専用 <-chan)
// results: 処理結果を送信するためのチャネル (送信専用 chan<-)
// wg: WaitGroup へのポインタ (終了通知のため)
func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	// このワーカー Goroutine が終了する際に Done() を呼ぶ
	defer wg.Done()

	// jobs チャネルから range でジョブを受信
	// jobs チャネルがクローズされるとループが終了する
	for job := range jobs {
		fmt.Printf("ワーカー %d: ジョブ %d を開始\n", id, job)
		// 処理をシミュレート (例: 0.5秒かかる)
		time.Sleep(500 * time.Millisecond)
		result := job * 2 // ジョブの内容を2倍にする
		fmt.Printf("ワーカー %d: ジョブ %d を完了、結果 %d\n", id, job, result)
		// results チャネルに処理結果を送信
		results <- result
	}
	fmt.Printf("ワーカー %d: ジョブチャネルがクローズされたため終了\n", id)
}

func main() {
	const numJobs = 9      // 処理するジョブの総数
	const numWorkers = 3 // 起動するワーカーの数

	// ジョブ送信用と結果受信用チャネルを作成 (バッファ付き)
	// バッファサイズはジョブ数に合わせておくと、送信/受信での不要なブロックを防ぎやすい
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)

	var wg sync.WaitGroup // ワーカーの終了を待つための WaitGroup

	fmt.Printf("%d 個のワーカーを起動します...\n", numWorkers)
	// --- ワーカー Goroutine の起動 ---
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1) // WaitGroup のカウンターを増やす
		// worker 関数を Goroutine として起動
		go worker(w, jobs, results, &wg)
	}

	fmt.Printf("%d 個のジョブを送信します...\n", numJobs)
	// --- ジョブの送信 ---
	for j := 1; j <= numJobs; j++ {
		jobs <- j // ジョブチャネルにジョブ (数値) を送信
	}
	// ★ すべてのジョブを送信したら、jobs チャネルをクローズする
	// これにより、ワーカーの for range ループが終了できるようになる
	close(jobs)
	fmt.Println("すべてのジョブを送信し、ジョブチャネルをクローズしました。")

	// --- ワーカーの終了待機 ---
	// すべてのワーカーが完了するのを待つ
	// これをしないと、結果を収集する前にプログラムが終了してしまう可能性がある
	fmt.Println("すべてのワーカーの完了を待機します...")
	wg.Wait()
	fmt.Println("すべてのワーカーが完了しました。")

	// ★ 結果チャネルもクローズする (オプションだが推奨) ★
	// これにより、次の結果収集ループが確実に終了する
	// 注意: WaitGroup でワーカーの終了を待った後に行うこと
	close(results)

	fmt.Printf("%d 個の結果を収集します...\n", numJobs)
	// --- 結果の収集 ---
	totalResultSum := 0
	// results チャネルから range で結果を受信 (results がクローズされるまで)
	for result := range results {
		fmt.Printf("結果を受信: %d\n", result)
		totalResultSum += result
	}
	// または、ジョブ数だけ結果を受信するループでも良い (results を close しない場合)
	// for a := 1; a <= numJobs; a++ {
	// 	result := <-results
	// 	fmt.Printf("結果 %d を受信: %d\n", a, result)
	// 	totalResultSum += result
	// }

	fmt.Println("すべての結果を収集しました。")
	fmt.Printf("結果の合計: %d\n", totalResultSum)
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
3 個のワーカーを起動します...
9 個のジョブを送信します...
すべてのジョブを送信し、ジョブチャネルをクローズしました。
すべてのワーカーの完了を待機します...
ワーカー 1: ジョブ 1 を開始
ワーカー 2: ジョブ 2 を開始
ワーカー 3: ジョブ 3 を開始
ワーカー 1: ジョブ 1 を完了、結果 2
ワーカー 1: ジョブ 4 を開始
ワーカー 2: ジョブ 2 を完了、結果 4
ワーカー 2: ジョブ 5 を開始
ワーカー 3: ジョブ 3 を完了、結果 6
ワーカー 3: ジョブ 6 を開始
ワーカー 1: ジョブ 4 を完了、結果 8
ワーカー 1: ジョブ 7 を開始
ワーカー 2: ジョブ 5 を完了、結果 10
ワーカー 2: ジョブ 8 を開始
ワーカー 3: ジョブ 6 を完了、結果 12
ワーカー 3: ジョブ 9 を開始
ワーカー 1: ジョブ 7 を完了、結果 14
ワーカー 1: ジョブチャネルがクローズされたため終了
ワーカー 2: ジョブ 8 を完了、結果 16
ワーカー 2: ジョブチャネルがクローズされたため終了
ワーカー 3: ジョブ 9 を完了、結果 18
ワーカー 3: ジョブチャネルがクローズされたため終了
すべてのワーカーが完了しました。
9 個の結果を収集します...
結果を受信: 2
結果を受信: 4
結果を受信: 6
結果を受信: 8
結果を受信: 10
結果を受信: 12
結果を受信: 14
結果を受信: 16
結果を受信: 18
すべての結果を収集しました。
結果の合計: 90
*/
```

**コード解説:**

*   `worker` 関数は、`jobs` チャネルから `for range` でジョブを受け取り、処理（ここでは0.5秒待って2倍する）を行い、結果を `results` チャネルに送信します。最後に `defer wg.Done()` で `WaitGroup` に完了を通知します。
*   `main` 関数では、まず `jobs` と `results` チャネルを作成します。
*   次に、`numWorkers` の数だけ `worker` Goroutine を起動し、`wg.Add(1)` でカウンターを増やします。
*   その後、`numJobs` の数だけジョブを `jobs` チャネルに送信します。
*   すべてのジョブを送信し終えたら、**必ず `close(jobs)` を呼び出します**。これにより、ワーカーの `for range jobs` ループが終了できます。
*   `wg.Wait()` で、すべてのワーカー Goroutine が `Done()` を呼び出すのを待ちます。
*   すべてのワーカーが終了した後、**`close(results)` を呼び出します**。これにより、結果を収集する `for range results` ループが安全に終了できます。
*   最後に `for result := range results` で、`results` チャネルからすべての処理結果を受信します。

ワーカープールパターンは、CPUバウンドなタスク（計算処理）や I/O バウンドなタスク（ネットワークリクエスト、ファイルアクセスなど）を効率的に並行処理するための基本的なテクニックです。ワーカー数を調整することで、システムの負荷を制御できます。