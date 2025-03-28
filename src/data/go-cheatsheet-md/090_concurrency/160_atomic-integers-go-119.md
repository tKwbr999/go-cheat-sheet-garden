---
title: "Atomic Integers (Go 1.19+)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 低レベル同期のためのアトミック操作 (Go 1.19+)
import "sync/atomic"

var counter atomic.Int64

// 値を追加して取得
counter.Add(10)
value := counter.Load()
fmt.Println("Counter:", value) // 10

// 比較して交換
// 値が 10 なら 20 に設定
swapped := counter.CompareAndSwap(10, 20)
fmt.Println("Swapped:", swapped) // true
fmt.Println("Counter:", counter.Load()) // 20

// 値を格納
counter.Store(100)
fmt.Println("Counter:", counter.Load()) // 100
```