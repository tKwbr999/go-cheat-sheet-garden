---
title: "Variadic with Other Parameters" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 他のパラメータを持つ可変長引数
func appendValues(slice []int, values ...int) []int {
  return append(slice, values...)
}

slice := []int{1, 2}
// [1 2 3 4 5]
slice = appendValues(slice, 3, 4, 5)
```