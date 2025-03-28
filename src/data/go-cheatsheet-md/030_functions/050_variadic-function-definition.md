---
title: "Variadic Function Definition" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 可変長引数関数 (可変数の引数を受け入れる)
func sum(nums ...int) int {
  total := 0
  for _, num := range nums {
    total += num
  }
  return total
}
```