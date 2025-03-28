---
title: "Interface Naming (-er Suffix)" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// 単一メソッドのインターフェースは -er で終わる
type Reader interface {
	Read(p []byte) (n int, err error)
}
```