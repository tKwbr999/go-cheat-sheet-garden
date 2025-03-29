## タイトル
title: インターフェース: インターフェースの実装 (暗黙的)

## タグ
tags: ["interfaces", "interface", "メソッド", "実装", "暗黙的", "ダックタイピング"]

## コード
```go
package main

import (
	"fmt"
	"math"
)

// インターフェース定義
type Shape interface {
	Area() float64
	Perimeter() float64
}

// 具体的な型: Rectangle
type Rectangle struct {
	Width, Height float64
}

// Rectangle が Shape のメソッドを実装
func (r Rectangle) Area() float64      { return r.Width * r.Height }
func (r Rectangle) Perimeter() float64 { return 2 * (r.Width + r.Height) }

// 具体的な型: Circle
type Circle struct {
	Radius float64
}

// Circle が Shape のメソッドを実装
func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }

func main() {
	// Rectangle と Circle は Shape のメソッドを全て持つので、
	// 暗黙的に Shape インターフェースを実装している
	var s1 Shape = Rectangle{Width: 10, Height: 5}
	var s2 Shape = Circle{Radius: 3}

	fmt.Printf("s1 (%T): Area=%.2f\n", s1, s1.Area())
	fmt.Printf("s2 (%T): Area=%.2f\n", s2, s2.Area())
}

```

## 解説
```text
Goのインターフェース実装は**暗黙的 (Implicit)** です。
`implements` のような明示的な宣言は不要です。

**実装条件:**
ある型が、特定のインターフェースで定義されている
**すべてのメソッド**を、**同じシグネチャ**
（メソッド名、引数、戻り値の型と順序）で持っていれば、
その型は自動的にそのインターフェースを実装しているとみなされます。

これは「アヒルのように歩き、鳴くならアヒルだ」という
**ダックタイピング (Duck Typing)** に似ています。

**コード例:**
`Shape` インターフェースは `Area() float64` と
`Perimeter() float64` を要求します。
`Rectangle` 型と `Circle` 型は、それぞれこれらのメソッドを
（異なる内容で）実装しています。
そのため、`Rectangle` と `Circle` は特別な宣言なしに
自動的に `Shape` インターフェースを実装していることになります。

もし `Perimeter` メソッドが欠けていたり、
`Area()` の戻り値が `int` だったりすると、
その型は `Shape` を実装しているとはみなされません。

**暗黙的実装の利点:**
*   **疎結合:** 型とインターフェースが互いに直接依存しない。
    後からインターフェースを定義して既存の型に適用できる。
*   **柔軟性:** 型は複数のインターフェースを同時に満たせる。
*   **簡潔性:** `implements` 宣言が不要。

この暗黙的実装はGoの柔軟性を支える重要な特徴です。