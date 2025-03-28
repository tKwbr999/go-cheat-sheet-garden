---
title: "Ranging Over Channels" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// チャネルを range で処理 (チャネルが閉じられると終了)
ch := make(chan int, 2)
ch <- 1
ch <- 2
close(ch)
for value := range ch {
	// 値を処理 (1, 2)
	fmt.Println(value)
}
```