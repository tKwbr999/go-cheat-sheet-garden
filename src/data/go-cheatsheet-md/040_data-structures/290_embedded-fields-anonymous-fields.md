---
title: "Embedded Fields (Anonymous Fields)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 無名フィールド (埋め込み)
type Employee struct {
	// すべての Person フィールドを埋め込む
	Person
	CompanyName string
	Salary      float64
}

e := Employee{}
// Person から昇格したフィールド
e.Name = "Dave"
// これでも動作する
e.Person.Name = "Dave"
e.CompanyName = "Acme"
```