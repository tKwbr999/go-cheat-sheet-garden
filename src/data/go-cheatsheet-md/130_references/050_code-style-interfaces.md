---
title: "Code Style: Interfaces" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// インターフェース - 単一メソッドのインターフェースは -er で終わる
type Reader interface {
  Read(p []byte) (n int, err error)
}
```