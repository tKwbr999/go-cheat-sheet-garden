---
title: "Atomic Integers (Go <1.19)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Go <1.19 のアトミック操作
import "sync/atomic"

var counter int64

// 追加して取得
atomic.AddInt64(&counter, 10)
value := atomic.LoadInt64(&counter)
fmt.Println("Counter:", value) // 10

// 比較して交換
swapped := atomic.CompareAndSwapInt64(&counter, 10, 20)
fmt.Println("Swapped:", swapped) // true
fmt.Println("Counter:", atomic.LoadInt64(&counter)) // 20

// 値を格納
atomic.StoreInt64(&counter, 100)
fmt.Println("Counter:", atomic.LoadInt64(&counter)) // 100
```