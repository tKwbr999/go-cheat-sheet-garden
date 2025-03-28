---
title: "Interface Composition" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// インターフェースは他のインターフェースから構成できる
type Reader interface {
  Read(p []byte) (n int, err error)
}

type Writer interface {
  Write(p []byte) (n int, err error)
}

// ReadWriter は Reader と Writer を組み合わせる
type ReadWriter interface {
  Reader
  Writer
}

// 型が Reader と Writer の両方を実装していれば、ReadWriter を実装する
type Buffer struct {
  // ...
}

func (b *Buffer) Read(p []byte) (n int, err error) {
  // 実装
  return len(p), nil
}

func (b *Buffer) Write(p []byte) (n int, err error) {
  // 実装
  return len(p), nil
}

// これで Buffer は ReadWriter として使用できる
var rw ReadWriter = &Buffer{}

// 標準ライブラリの例
// io.ReadCloser, io.WriteCloser, io.ReadWriteCloser
```