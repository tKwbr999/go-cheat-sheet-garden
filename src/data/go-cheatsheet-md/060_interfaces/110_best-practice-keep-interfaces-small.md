---
title: "Best Practice: Keep Interfaces Small" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 1. インターフェースを小さく保つ (単一責任)
// 良い例:
type Reader interface {
  Read(p []byte) (n int, err error)
}

type Writer interface {
  Write(p []byte) (n int, err error)
}
```