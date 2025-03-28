---
title: "Anonymous Structs" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 無名構造体 (一度きりの使用)
point := struct {
	X, Y int
}{10, 20}
```