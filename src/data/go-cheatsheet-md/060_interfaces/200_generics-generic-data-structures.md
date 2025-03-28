---
title: "Generics: Generic Data Structures" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// ジェネリックデータ構造
type List[T any] struct {
	data []T
}

func (l *List[T]) Add(item T) {
	l.data = append(l.data, item)
}

func (l *List[T]) Get(index int) T {
	return l.data[index]
}
```