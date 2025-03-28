---
title: "Directional Channels" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 方向性チャネル (型制限)
// チャネルへの送信のみ可能
func producer(ch chan<- int) {
	ch <- 42
	// <-ch // コンパイルエラー
}

// チャネルからの受信のみ可能
func consumer(ch <-chan int) {
	value := <-ch
	// ch <- 42 // コンパイルエラー
	fmt.Println(value)
}
```