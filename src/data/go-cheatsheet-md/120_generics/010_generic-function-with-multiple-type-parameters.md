---
title: "Generic Function with Multiple Type Parameters" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 複数の型パラメータ
func Map[T, U any](s []T, f func(T) U) []U {
  result := make([]U, len(s))
  for i, v := range s {
    result[i] = f(v)
  }
  return result
}

// 使用法
nums := []int{1, 2, 3}
squares := Map(nums, func(x int) int { return x * x })
strings := Map(nums, func(x int) string { return fmt.Sprintf("#%d", x) })
```