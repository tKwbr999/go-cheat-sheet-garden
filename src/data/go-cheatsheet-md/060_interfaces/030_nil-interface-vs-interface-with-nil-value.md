---
title: "Nil Interface vs Interface with Nil Value" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

インターフェース値は 2 ワード構造:
1. 型情報へのポインタ (型記述子)
2. 実際のデータへのポインタ (値)

```go
// nil インターフェース
// ゼロ値は nil
var s Shape
// true
fmt.Println(s == nil)

// 具体的な値を持つインターフェース
// s は型情報と値を含む
s = Rectangle{5, 10}
// "main.Rectangle"
fmt.Printf("%T\n", s)

// nil 値を持つインターフェース (ただし型は定義されている)
var p *Rectangle = nil
// s は型情報を持つが値は nil
s = p
// false - インターフェース値は nil ではない
fmt.Println(s == nil)
// "*main.Rectangle"
fmt.Printf("%T\n", s)
```