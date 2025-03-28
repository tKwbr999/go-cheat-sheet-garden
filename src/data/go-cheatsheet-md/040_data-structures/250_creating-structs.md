---
title: "Creating Structs" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 構造体を作成
// 名前付きフィールド (推奨)
p1 := Person{Name: "Alice", Age: 30}
// 位置指定フィールド (壊れやすい)
p2 := Person{"Bob", 25, nil}
// ゼロ化された Person を割り当て、*Person を返す
p3 := new(Person)
```