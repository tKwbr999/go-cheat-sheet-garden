---
title: "Type Constraints using Interfaces" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 型制約は使用できる型を制限する

// 型要素を持つインターフェースを使用した制約
type Numeric interface {
  int | int8 | int16 | int32 | int64 |
  uint | uint8 | uint16 | uint32 | uint64 |
  float32 | float64
}

// 制約付きのジェネリック関数
func Sum[T Numeric](values []T) T {
  var sum T
  for _, v := range values {
    sum += v
  }
  return sum
}

// 使用法
// 動作する: int は Numeric を満たす
Sum([]int{1, 2, 3})
// 動作する: float64 は Numeric を満たす
Sum([]float64{1.1, 2.2, 3.3})
// Sum([]string{"a", "b"})    // コンパイルエラー: string は Numeric を満たさない
```