## タイトル
title: 構造体の埋め込み (Embedding / Anonymous Fields)

## タグ
tags: ["data-structures", "構造体", "struct", "埋め込み", "匿名フィールド", "継承", "is-a"]

## コード
```go
package main

import "fmt"

type Point struct {
	X, Y int
}

func (p Point) Display() {
	fmt.Printf("[%d, %d]", p.X, p.Y)
}

type Circle struct {
	Point  // Point 型を匿名フィールドとして埋め込む
	Radius int
}

func (c Circle) Area() float64 {
	return 3.14 * float64(c.Radius*c.Radius) // 簡略化
}

func main() {
	c1 := Circle{
		Point:  Point{X: 10, Y: 20}, // 型名をフィールド名のように使う
		Radius: 5,
	}
	fmt.Printf("c1: %+v\n", c1)

	// 昇格したフィールドへのアクセス
	fmt.Printf("X座標 (c1.X): %d\n", c1.X) // c1.Point.X と書かずに済む
	fmt.Printf("半径 (c1.Radius): %d\n", c1.Radius)

	// 昇格したメソッドの呼び出し
	fmt.Print("座標表示 (c1.Display): ")
	c1.Display() // c1.Point.Display() と書かずに済む
	fmt.Println()

	// Circle 自身のメソッド
	fmt.Printf("面積 (c1.Area): %f\n", c1.Area())
}

```

## 解説
```text
Goには伝統的な「継承」はありませんが、
**構造体の埋め込み (Embedding)** で似た効果を実現できます。
フィールド定義で**フィールド名を省略し、型名だけを記述**します
(**匿名フィールド**とも呼ばれます)。

**構文:**
```go
type Outer struct {
    InnerType // フィールド名を省略
    OtherField string
}
```

**効果: フィールドとメソッドの昇格**
型 `InnerType` を `Outer` に埋め込むと、`InnerType` の
**エクスポートされたフィールドとメソッド**が、
あたかも `Outer` 自身のもののように**直接アクセス**
できるようになります (昇格)。

内部的には `Outer` は `InnerType` という名前のフィールドを
持ちますが、Goが特別扱いして直接アクセスを可能にします。

**コード例:**
`Circle` 構造体に `Point` 型を埋め込んでいます。
*   **初期化:** `Circle{ Point: Point{...}, Radius: ... }` のように
    埋め込んだ型名をフィールド名のように使って初期化します。
*   **フィールドアクセス:** `c1.Point.X` の代わりに `c1.X` で
    `Point` の `X` フィールドに直接アクセスできます (`Y` も同様)。
*   **メソッドアクセス:** `Point` の `Display` メソッドも昇格し、
    `c1.Point.Display()` の代わりに `c1.Display()` で呼び出せます。
*   埋め込んだ型名経由 (`c1.Point.X`) でもアクセス可能です。

**フィールド名の衝突:**
もし `Circle` 自身にも `X` というフィールドがあった場合、
`c1.X` は `Circle` の `X` を指します。埋め込まれた `Point` の
`X` にアクセスするには `c1.Point.X` と明示的に書く必要があります。

**埋め込み vs ネスト:**
*   **ネスト (`Dept Department`):** 「〜が〜を持つ (has-a)」。
    アクセスは `emp.Dept.Name`。
*   **埋め込み (`Point`):** 「〜は〜の一種 (is-a)」、型の合成、
    コード再利用 (Mix-in)。アクセスは `c1.X` (昇格)。

埋め込みはGoのコード再利用と構成のための強力なメカニズムです。