---
title: "Exported vs Unexported" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// エクスポートされた関数 (大文字で始まる)
func Add(a, b int) int {
	return a + b
}

// エクスポートされない関数 (小文字で始まる)
func multiply(a, b int) int {
	return a * b
}
```