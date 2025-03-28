---
title: "Function as Argument" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 引数としての関数
func process(apply func(int, int) int, a, b int) int {
  return apply(a, b)
}
// 15
result := process(func(x, y int) int { return x * y }, 5, 3)
```