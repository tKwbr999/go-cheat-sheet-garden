---
title: "Basic Select" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Select 文は複数のチャネル操作を待機できる
ch1 := make(chan string)
ch2 := make(chan string)

go func() { time.Sleep(1 * time.Second); ch1 <- "one" }()
go func() { time.Sleep(2 * time.Second); ch2 <- "two" }()

for i := 0; i < 2; i++ {
  select {
  case msg1 := <-ch1:
    fmt.Println("received", msg1)
  case msg2 := <-ch2:
    fmt.Println("received", msg2)
  }
}
```