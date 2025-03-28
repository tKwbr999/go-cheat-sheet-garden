---
title: "Worker Pool Pattern" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// ワーカープールパターン
func worker(id int, jobs <-chan Job, results chan<- Result) {
  for job := range jobs {
    results <- process(job)
  }
}

// プールを作成
jobs := make(chan Job, 100)
results := make(chan Result, 100)

// ワーカーを開始
for w := 1; w <= 3; w++ {
  go worker(w, jobs, results)
}

// ジョブを送信し、結果を収集
for _, j := range allJobs {
  jobs <- j
}
close(jobs)

// 結果を収集
for range allJobs {
  result := <-results
  // 結果を使用
}
```