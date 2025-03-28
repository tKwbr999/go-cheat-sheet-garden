---
title: "Select with Quit Channel" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 終了チャネル
func worker(ch <-chan int, quit <-chan bool) {
  for {
    select {
    case value := <-ch:
      fmt.Println("Processing", value)
    case <-quit:
      fmt.Println("Quitting")
      return
    }
  }
}

ch := make(chan int)
quit := make(chan bool)

go worker(ch, quit)

ch <- 1
ch <- 2
quit <- true
```