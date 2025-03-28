---
title: "Channel Basics (Create, Send, Receive, Close)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// チャネルは Goroutine 間の通信のための型付きパイプ

// チャネルを作成
// バッファなし
ch := make(chan int)
// バッファあり (capacity 10)
buffCh := make(chan int, 10)

// チャネルに送信 (矢印はチャネルを指す)
// バッファなしチャネル、またはバッファありチャネルが満杯の場合にブロックする
ch <- 42

// チャネルから受信 (矢印はチャネルから出る)
// チャネルが空の場合にブロックする
value := <-ch

// チャネルを閉じる (送信側が閉じるべき)
close(ch)

// チャネルが閉じているか確認
// チャネルが閉じていて空の場合、ok は false
value, ok := <-ch
```