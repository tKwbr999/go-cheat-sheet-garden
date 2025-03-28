---
title: "Select with Timeout" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// タイムアウト
ch := make(chan string, 1)
go func() {
  time.Sleep(2 * time.Second)
  ch <- "result"
}()

select {
case res := <-ch:
  fmt.Println(res)
case <-time.After(1 * time.Second):
  fmt.Println("timeout 1")
}
```