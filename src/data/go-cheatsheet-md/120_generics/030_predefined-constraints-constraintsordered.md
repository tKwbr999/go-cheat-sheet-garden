---
title: "Predefined Constraints (constraints.Ordered)" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// golang.org/x/exp/constraints から事前定義された制約を使用する
import "golang.org/x/exp/constraints"

func Max[T constraints.Ordered](a, b T) T {
  if a > b {
    return a
  }
  return b
}

// 使用法
// int で動作する
Max(5, 10)
// string で動作する (文字列は順序付け可能)
Max("a", "b")
```