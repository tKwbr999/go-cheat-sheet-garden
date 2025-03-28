---
title: "Worker Pool Pattern" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// チャネルパターン: ワーカープール
func worker(id int, jobs <-chan int, results chan<- int) {
  for j := range jobs {
    fmt.Printf("Worker %d processing job %d\n", id, j)
    time.Sleep(time.Millisecond * 500) // 処理をシミュレート
    results <- j * 2
  }
}

jobs := make(chan int, 100)
results := make(chan int, 100)

// 3つのワーカーを開始
numWorkers := 3
for w := 1; w <= numWorkers; w++ {
  go worker(w, jobs, results)
}

// ジョブを送信
numJobs := 9
for j := 1; j <= numJobs; j++ {
  jobs <- j
}
close(jobs)

// 結果を収集
for a := 1; a <= numJobs; a++ {
  <-results
}
```