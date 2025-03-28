---
title: "インターフェース: インターフェースを使ったポリモーフィズム"
tags: ["interfaces", "interface", "メソッド", "ポリモーフィズム", "多態性", "疎結合"]
---

インターフェースの真価は、それが**ポリモーフィズム (Polymorphism, 多態性)** を実現する点にあります。ポリモーフィズムとは、同じインターフェース型の変数を使って、実際には異なる型を持つオブジェクト（値）を統一的に扱うことができる性質のことです。

## インターフェース型の変数

インターフェース型（例: `Shape`）の変数を宣言すると、その変数には、そのインターフェースを**実装している任意の具体的な型の値**（例: `Rectangle` の値や `Circle` の値）を代入することができます。

```go
var s Shape // Shape 型の変数を宣言
s = Rectangle{Width: 10, Height: 5} // Shape を実装する Rectangle の値を代入できる
s = Circle{Radius: 3}              // Shape を実装する Circle の値も代入できる
```

## インターフェース経由でのメソッド呼び出し

インターフェース型の変数を通じてメソッドを呼び出すと、その変数に**現在格納されている具体的な型のメソッド**が実行されます。これを**動的ディスパッチ (Dynamic Dispatch)** と呼びます。

これにより、関数などは引数としてインターフェース型を受け取るだけで、具体的な型を意識することなく、そのインターフェースが保証するメソッドを呼び出すことができます。

## コード例: 様々な図形を統一的に扱う

前のセクションで定義した `Shape`, `Rectangle`, `Circle` を使って、インターフェースの利用例を見てみましょう。

```go title="インターフェースを使ったポリモーフィズムの例"
package main

import (
	"fmt"
	"math"
)

// --- インターフェース定義 (再掲) ---
type Shape interface {
	Area() float64
	Perimeter() float64
}

// --- 具体的な型の定義 (再掲) ---
type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}
func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}
func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}

// --- インターフェースを利用する関数 ---

// Shape インターフェース型の引数を受け取る関数
// この関数は Rectangle や Circle の具体的な実装を知らない
func printShapeInfo(s Shape) {
	// s が実際に Rectangle でも Circle でも、
	// Shape インターフェースが保証する Area() と Perimeter() を呼び出せる
	fmt.Printf("  図形: %T, ", s) // %T で具体的な型を表示
	fmt.Printf("面積: %.2f, ", s.Area())
	fmt.Printf("周長: %.2f\n", s.Perimeter())
}

// Shape インターフェース型のスライスを受け取り、合計面積を計算する関数
func totalArea(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Area() // 各要素の Area() メソッドを呼び出す
	}
	return total
}

func main() {
	// 具体的な型の変数を作成
	rect := Rectangle{Width: 10, Height: 5}
	circ := Circle{Radius: 3}

	fmt.Println("--- printShapeInfo 関数呼び出し ---")
	// printShapeInfo は Shape 型の引数を取るが、
	// Rectangle と Circle は Shape を実装しているので渡せる
	printShapeInfo(rect) // rect (Rectangle) を渡す
	printShapeInfo(circ) // circ (Circle) を渡す

	fmt.Println("\n--- インターフェース型の変数 ---")
	var s1 Shape // Shape 型の変数
	s1 = rect    // Rectangle の値を代入
	fmt.Printf("s1 (Rectangle): 面積=%.2f\n", s1.Area())

	s1 = circ    // 同じ変数に Circle の値を代入
	fmt.Printf("s1 (Circle): 面積=%.2f\n", s1.Area())

	fmt.Println("\n--- インターフェース型のスライス ---")
	// Shape インターフェース型のスライスを作成
	// このスライスには Shape を満たす任意の型の値を格納できる
	shapes := []Shape{
		Rectangle{Width: 2, Height: 3},
		Circle{Radius: 1},
		Rectangle{Width: 4, Height: 4},
	}

	// スライス内の各図形の情報を表示
	fmt.Println("スライス内の図形情報:")
	for _, shape := range shapes {
		printShapeInfo(shape)
	}

	// 合計面積を計算
	fmt.Printf("\n合計面積: %.2f\n", totalArea(shapes))
}

/* 実行結果:
--- printShapeInfo 関数呼び出し ---
  図形: main.Rectangle, 面積: 50.00, 周長: 30.00
  図形: main.Circle, 面積: 28.27, 周長: 18.85

--- インターフェース型の変数 ---
s1 (Rectangle): 面積=50.00
s1 (Circle): 面積=28.27

--- インターフェース型のスライス ---
スライス内の図形情報:
  図形: main.Rectangle, 面積: 6.00, 周長: 10.00
  図形: main.Circle, 面積: 3.14, 周長: 6.28
  図形: main.Rectangle, 面積: 16.00, 周長: 16.00

合計面積: 25.14
*/
```

**コード解説:**

*   `printShapeInfo` 関数は引数として `Shape` インターフェースを受け取ります。`main` 関数から `Rectangle` 型の `rect` や `Circle` 型の `circ` を渡すと、それぞれの型で実装された `Area()` と `Perimeter()` が呼び出されます。`printShapeInfo` 関数は、渡された値の具体的な型を知る必要がありません。
*   `var s1 Shape` のようにインターフェース型の変数を宣言し、`s1 = rect` や `s1 = circ` のように、インターフェースを実装する具体的な型の値を代入できます。`s1.Area()` を呼び出すと、その時点で `s1` に入っている値の型の `Area` メソッドが実行されます。
*   `shapes := []Shape{...}` のように、インターフェース型のスライスを作成すると、そのスライスに `Rectangle` や `Circle` など、`Shape` インターフェースを満たす**異なる型の値**を混在させて格納できます。
*   `totalArea` 関数は `[]Shape` を受け取り、`for range` で各要素 `s` の `s.Area()` を呼び出すだけで、具体的な型を気にせずに合計面積を計算できています。

## インターフェースの利点

*   **疎結合 (Loose Coupling):** 関数や型は、具体的な実装ではなく、インターフェース（振る舞いの契約）に依存することができます。これにより、システムの各部分の独立性が高まり、変更や拡張が容易になります。
*   **柔軟性・拡張性:** 新しい型がインターフェースを満たすメソッドを実装しさえすれば、既存のインターフェースを利用するコードを変更することなく、その新しい型を扱えるようになります。
*   **テスト容易性:** インターフェースを使うことで、依存する部分をモック（テスト用の偽物）に置き換えやすくなり、単体テストが容易になります（テストダブル）。

インターフェースは、Go言語における抽象化とポリモーフィズムを実現するための中心的な機能であり、クリーンで保守性の高いコードを書くために不可欠です。