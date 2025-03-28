---
title: "Context Cancellation" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// キャンセル
ctx, cancel := context.WithCancel(context.Background())

var wg sync.WaitGroup
wg.Add(1)
go func(innerCtx context.Context) {
  defer wg.Done()
  err := doWork(innerCtx)
  if err != nil {
    fmt.Println("Goroutine error:", err)
  }
}(ctx)

// 少し待ってからキャンセル
time.Sleep(500 * time.Millisecond)
fmt.Println("Cancelling context")
cancel() // キャンセルを通知

wg.Wait()
```