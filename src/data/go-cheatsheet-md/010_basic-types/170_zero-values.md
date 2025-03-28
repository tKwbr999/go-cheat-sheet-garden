---
title: "Zero Values" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// すべての型にはゼロ値がある (宣言されたが初期化されていない場合のデフォルト)
// 0
var i int

// 0.0
var f float64

// false
var b bool

// "" (empty string)
var s string

// nil (zero pointer)
var p *int

// nil (zero slice)
var slice []int

// nil (zero map)
var map1 map[string]int

// nil (zero channel)
var ch chan int

// nil (zero function)
var func1 func()

// nil (zero interface)
var err error

// 構造体のゼロ値は、すべてのフィールドがそれぞれのゼロ値に設定される
type Person struct {
	Name string
	Age  int
}

// {Name: "", Age: 0}
var p Person
```