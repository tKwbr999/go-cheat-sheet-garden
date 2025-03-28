---
title: "Function as Variable" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 変数としての関数
var compute func(int, int) int
compute = func(a, b int) int {
	return a + b
}
// 8
result := compute(5, 3)
```