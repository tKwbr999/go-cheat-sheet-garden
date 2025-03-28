---
title: "Generic Optional/Maybe Type" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 一般的なジェネリックパターンとイディオム

// 1. ジェネリック Optional/Maybe 型
type Optional[T any] struct {
  value T
  valid bool
}

func Some[T any](value T) Optional[T] {
  return Optional[T]{value: value, valid: true}
}

func None[T any]() Optional[T] {
  return Optional[T]{valid: false}
}

func (o Optional[T]) IsPresent() bool {
  return o.valid
}

func (o Optional[T]) Get() (T, bool) {
  return o.value, o.valid
}
```