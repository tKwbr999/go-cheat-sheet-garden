---
title: "Generic Function with Type Parameter" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// Go 1.18 で導入されたジェネリクスの構文

// 型パラメータ T を持つジェネリック関数
func Print[T any](value T) {
  fmt.Println(value)
}

// 使用法
// T は int
Print(42)
// T は string
Print("hello")
// T は []float64
Print([]float64{1.1, 2.2})
```