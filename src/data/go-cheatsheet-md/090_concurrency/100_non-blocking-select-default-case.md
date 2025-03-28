---
title: "Non-Blocking Select (Default Case)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// ノンブロッキングチャネル操作
ch := make(chan string)

select {
case msg := <-ch:
  fmt.Println("received message", msg)
default:
  fmt.Println("no message received")
}
```