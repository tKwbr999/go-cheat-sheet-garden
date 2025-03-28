---
title: "Generic Result Type" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 2. エラー処理のためのジェネリック Result 型
type Result[T any] struct {
  value T
  err   error
}

func Success[T any](value T) Result[T] {
  return Result[T]{value: value}
}

func Failure[T any](err error) Result[T] {
  return Result[T]{err: err}
}

func (r Result[T]) IsOk() bool {
  return r.err == nil
}

func (r Result[T]) Value() T {
  return r.value
}

func (r Result[T]) Error() error {
  return r.err
}
```