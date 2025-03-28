---
title: "Cond (sync.Cond)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Cond - イベント待機のための条件変数
var sharedRsc = make(map[string]string)
var mu sync.Mutex
cond := sync.NewCond(&mu)

go func() { // producer
  time.Sleep(1 * time.Second)
  cond.L.Lock()
  sharedRsc["data"] = "some data"
  fmt.Println("Producer produced data")
  cond.Signal() // 待機中の Goroutine を1つ起こす
  // cond.Broadcast() // すべての待機者を起こす
  cond.L.Unlock()
}()

// consumer
cond.L.Lock()
for sharedRsc["data"] == "" { // 条件をチェック
  fmt.Println("Consumer waiting...")
  cond.Wait() // アンロックし、待機し、再度ロックする
}
fmt.Println("Consumer received:", sharedRsc["data"])
cond.L.Unlock()
```