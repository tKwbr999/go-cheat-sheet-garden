---
title: "Generics: Generic Functions with Constraints" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 制約付きのジェネリック関数
func Sum[T Number](values []T) T {
  var sum T
  for _, v := range values {
    sum += v
  }
  return sum
}

// 使用法
ints := []int{1, 2, 3, 4}
// 型推論: sum は int
sum := Sum(ints)

floats := []float64{1.1, 2.2, 3.3}
// 型推論: floatSum は float64
floatSum := Sum(floats)
```