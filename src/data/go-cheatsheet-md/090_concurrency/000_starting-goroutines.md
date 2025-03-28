---
title: "Starting Goroutines" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Goroutine は Go ランタイムによって管理される軽量スレッド

// Goroutine を開始
go func() {
	// コードは並行して実行される
	fmt.Println("Running in goroutine")
}()

// 関数を Goroutine で実行
go myFunction(arg1, arg2)

// Main は実行を継続
fmt.Println("Main function continues")

// Goroutine の終了を待つ (最も簡単な方法)
// 本番環境では信頼できない
time.Sleep(time.Second)
```