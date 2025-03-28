---
title: "Generics: Constraint Interfaces" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 型パラメータ (ジェネリクス) とインターフェース

// 制約インターフェース (許可される型を定義)
type Number interface {
  int | int32 | int64 | float32 | float64
}
```