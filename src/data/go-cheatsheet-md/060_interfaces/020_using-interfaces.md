## タイトル
title: インターフェースを使ったポリモーフィズム

## タグ
tags: ["interfaces", "interface", "メソッド", "ポリモーフィズム", "多態性", "疎結合"]

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

// 具体的な型 Rectangle
type Rectangle struct{ Width, Height float64 }
func (r Rectangle) Area() float64      { return r.Width * r.Height }
func (r Rectangle) Perimeter() float64 { return 2 * (r.Width + r.Height) }

// 具体的な型 Circle
type Circle struct{ Radius float64 }
func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }

// インターフェースを利用する関数
func printShapeInfo(s Shape) {
	fmt.Printf("  図形:%T, 面積:%.2f, 周長:%.2f\n", s, s.Area(), s.Perimeter())
}

func main() {
	rect := Rectangle{Width: 10, Height: 5}
	circ := Circle{Radius: 3}

	fmt.Println("--- printShapeInfo 呼び出し ---")
	// Shape を実装する具体的な型 (Rectangle, Circle) を渡せる
	printShapeInfo(rect)
	printShapeInfo(circ)

	// var s Shape = rect // インターフェース型変数にも代入可
	// s = circ
	// fmt.Println(s.Area())

	// shapes := []Shape{rect, circ} // インターフェース型スライスも可
	// fmt.Println(totalArea(shapes))
}

// func totalArea(shapes []Shape) float64 { ... } // (実装略)

```

## 解説
```text
インターフェースの真価は**ポリモーフィズム (多態性)** にあります。
これは、同じインターフェース型の変数で、実際には異なる型を持つ
値を統一的に扱える性質です。

**インターフェース型の変数:**
インターフェース型 (例: `Shape`) の変数には、
そのインターフェースを実装する任意の具体的な型の値
(例: `Rectangle` や `Circle` の値) を代入できます。
`var s Shape = Rectangle{...}`
`s = Circle{...}`

**インターフェース経由のメソッド呼び出し:**
インターフェース型の変数を通じてメソッドを呼び出すと、
その変数に**現在格納されている具体的な型のメソッド**が
実行されます (動的ディスパッチ)。

コード例の `printShapeInfo` 関数は引数に `Shape` を取ります。
`main` から `Rectangle` 型の `rect` や `Circle` 型の `circ` を
渡すと、それぞれの `Area()` や `Perimeter()` が呼び出されます。
`printShapeInfo` は具体的な型を意識する必要がありません。

同様に、`[]Shape` のようなインターフェース型のスライスを作れば、
`Rectangle` や `Circle` など異なる型の値を混在させて格納し、
ループ内で統一的に `Area()` を呼び出す、といった処理も可能です。

**インターフェースの利点:**
*   **疎結合:** 具体的な実装ではなく、インターフェース (契約) に
    依存できるため、各部分の独立性が高まる。
*   **柔軟性・拡張性:** 新しい型がインターフェースを満たせば、
    既存コードを変更せずにその型を扱えるようになる。
*   **テスト容易性:** 依存部分をインターフェース経由にすれば、
    テスト時にモックを使いやすくなる。

インターフェースはGoの抽象化とポリモーフィズムの中心であり、
クリーンで保守性の高いコードに不可欠です。