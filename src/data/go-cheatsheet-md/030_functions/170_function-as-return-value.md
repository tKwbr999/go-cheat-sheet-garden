---
title: "Function as Return Value" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 戻り値としての関数
func multiplier(factor int) func(int) int {
  return func(n int) int {
    return n * factor
  }
}
double := multiplier(2)
triple := multiplier(3)
// 10
fmt.Println(double(5))
// 15
fmt.Println(triple(5))
```