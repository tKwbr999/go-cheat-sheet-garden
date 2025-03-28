---
title: "Multiple Return Values" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 複数の戻り値
func divAndRemainder(a, b int) (int, int) {
	return a / b, a % b
}
```