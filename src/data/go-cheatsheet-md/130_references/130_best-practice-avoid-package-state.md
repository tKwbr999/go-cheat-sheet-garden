---
title: "Best Practice: Avoid Package State" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 5. 可能な限りパッケージレベルの状態を避ける
// 悪い例:
var db *sql.DB

// より良い例:
type Service struct {
	db *sql.DB
}
```