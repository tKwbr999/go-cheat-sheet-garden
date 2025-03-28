---
title: "Generic Stack" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// ジェネリックデータ構造

// ジェネリックスタック
type Stack[T any] struct {
  items []T
}

func (s *Stack[T]) Push(item T) {
  s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
  var zero T
  if len(s.items) == 0 {
    return zero, false
  }
  
  n := len(s.items) - 1
  item := s.items[n]
  s.items = s.items[:n]
  return item, true
}

// 使用法
intStack := Stack[int]{}
intStack.Push(10)
intStack.Push(20)
// val=20, ok=true
val, ok := intStack.Pop()

strStack := Stack[string]{}
strStack.Push("hello")
// val2="hello", ok=true
val2, ok := strStack.Pop()
```