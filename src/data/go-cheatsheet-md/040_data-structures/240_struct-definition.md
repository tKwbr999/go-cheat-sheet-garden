---
title: "Struct Definition" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 構造体型を定義
type Person struct {
  Name    string
  Age     int
  Address *Address
}

type Address struct {
  Street string
  City   string
}
```