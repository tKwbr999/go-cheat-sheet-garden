---
title: "インターフェース: インターフェースの実装 (暗黙的)"
tags: ["interfaces", "interface", "メソッド", "実装", "暗黙的", "ダックタイピング"]
---

前のセクションでインターフェースがメソッドシグネチャの集まり（契約）を定義することを見ました。では、具体的な型（構造体など）は、どのようにしてその契約を満たす（インターフェースを**実装する**）のでしょうか？

## 暗黙的なインターフェース実装

Go言語のインターフェース実装における最大の特徴は、それが**暗黙的 (Implicit)** であることです。他の多くのオブジェクト指向言語のように `implements` のようなキーワードを使って、ある型が特定のインターフェースを実装することを明示的に宣言する必要は**ありません**。

Goでは、ある型が、特定のインターフェースで定義されている**すべてのメソッド**を、**同じシグネチャ（メソッド名、引数の型と順序、戻り値の型と順序）で持っていれば**、その型は自動的にそのインターフェースを実装しているとみなされます。

これは「もしそれがアヒルのように歩き、アヒルのように鳴くなら、それはアヒルである」という考え方に似ているため、**ダックタイピング (Duck Typing)** の一種とも言われます。

## コード例: `Shape` インターフェースの実装

前のセクションで定義した `Shape` インターフェースを、`Rectangle` (長方形) と `Circle` (円) という2つの具体的な構造体で実装してみましょう。

```go title="インターフェースの実装例"
package main

import (
	"fmt"
	"math" // 円周率 Pi を使うため
)

// --- インターフェース定義 (再掲) ---
type Shape interface {
	Area() float64
	Perimeter() float64
}

// --- 具体的な型の定義 ---

// Rectangle 構造体
type Rectangle struct {
	Width, Height float64
}

// Circle 構造体
type Circle struct {
	Radius float64
}

// --- Rectangle 型に対するメソッド実装 ---

// Area メソッド: Rectangle の面積を計算
// Shape インターフェースの Area() シグネチャに合致する
func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

// Perimeter メソッド: Rectangle の周長を計算
// Shape インターフェースの Perimeter() シグネチャに合致する
func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

// --- Circle 型に対するメソッド実装 ---

// Area メソッド: Circle の面積を計算
// Shape インターフェースの Area() シグネチャに合致する
func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

// Perimeter メソッド: Circle の周長 (円周) を計算
// Shape インターフェースの Perimeter() シグネチャに合致する
func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}

// main 関数 (ここでは実装を示すため、利用例は次のセクションで)
func main() {
	// Rectangle 型は Area() と Perimeter() メソッドを持つため、
	// 暗黙的に Shape インターフェースを実装している。
	var r Rectangle = Rectangle{Width: 10, Height: 5}
	// var s1 Shape = r // このように Shape 型の変数に代入できる (次のセクションで解説)
	fmt.Printf("Rectangle r は Shape インターフェースを満たします (Area, Perimeter を実装)。%+v\n", r)

	// Circle 型も Area() と Perimeter() メソッドを持つため、
	// 暗黙的に Shape インターフェースを実装している。
	var c Circle = Circle{Radius: 3}
	// var s2 Shape = c // このように Shape 型の変数に代入できる
	fmt.Printf("Circle c は Shape インターフェースを満たします (Area, Perimeter を実装)。%+v\n", c)

	// もしどちらかのメソッドが欠けていたり、シグネチャが異なっていたりすると、
	// その型は Shape インターフェースを実装しているとはみなされない。
	// type Triangle struct { Base, Height float64 }
	// func (t Triangle) Area() float64 { return 0.5 * t.Base * t.Height }
	// var t Triangle
	// var s3 Shape = t // コンパイルエラー: Triangle does not implement Shape (missing Perimeter method)
}

/* 実行結果:
Rectangle r は Shape インターフェースを満たします (Area, Perimeter を実装)。{Width:10 Height:5}
Circle c は Shape インターフェースを満たします (Area, Perimeter を実装)。{Radius:3}
*/
```

**コード解説:**

*   `Rectangle` 構造体は、`Shape` インターフェースが要求する `Area() float64` と `Perimeter() float64` の両方のメソッドを（同じシグネチャで）定義しています。
*   `Circle` 構造体も同様に、`Area() float64` と `Perimeter() float64` の両方のメソッドを定義しています。
*   これにより、`Rectangle` と `Circle` は、特別な宣言なしに、**自動的に `Shape` インターフェースを実装している**とみなされます。
*   コメントアウトされている `Triangle` の例のように、インターフェースが要求するメソッドの一部しか実装していない場合、その型はインターフェースを実装しているとはみなされません。

## 暗黙的実装の利点

*   **疎結合:** 型定義とインターフェース定義が互いに直接依存する必要がありません。後からインターフェースを定義して、既存の型がそれを満たしているかのように扱うことも可能です。
*   **柔軟性:** 型は複数のインターフェースを同時に満たすことができます。必要なメソッドをすべて持っていれば良いだけです。
*   **簡潔性:** `implements` のような宣言が不要なため、コードが簡潔になります。

この暗黙的なインターフェース実装は、Goの柔軟性と拡張性を支える重要な特徴です。次のセクションでは、インターフェース型の変数を実際にどのように使うかを見ていきます。