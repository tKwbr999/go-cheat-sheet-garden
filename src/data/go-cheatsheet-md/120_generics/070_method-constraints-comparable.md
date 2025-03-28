---
title: "Method Constraints (Comparable)" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// メソッドと型セットを持つ型制約
type Comparable[T any] interface {
  CompareTo(T) int
}

func Sort[T Comparable[T]](items []T) {
  for i := range items {
    for j := i + 1; j < len(items); j++ {
      if items[i].CompareTo(items[j]) > 0 {
        items[i], items[j] = items[j], items[i]
      }
    }
  }
}

// Comparable を実装
type Version struct {
  Major, Minor, Patch int
}

func (v Version) CompareTo(other Version) int {
  if v.Major != other.Major {
    return v.Major - other.Major
  }
  if v.Minor != other.Minor {
    return v.Minor - other.Minor
  }
  return v.Patch - other.Patch
}
```