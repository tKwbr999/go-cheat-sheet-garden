---
title: "データ構造: 構造体の埋め込み (Embedding / Anonymous Fields)"
tags: ["data-structures", "構造体", "struct", "埋め込み", "匿名フィールド", "継承", "is-a"]
---

Go言語には、他の言語のような伝統的な「継承 (Inheritance)」の仕組みはありませんが、**構造体の埋め込み (Embedding)** という機能を使って、似たような効果（コードの再利用や型の合成）を実現できます。これは、構造体のフィールド定義で**フィールド名を省略し、型名だけを記述**することで行われます。このため、**匿名フィールド (Anonymous Field)** とも呼ばれます。

## 構造体の埋め込みとは？

ある構造体の中に、別の構造体型（またはインターフェース型、あるいはそれらへのポインタ型）を、フィールド名を付けずに型名だけで記述すると、その型が「埋め込まれた」ことになります。

**構文:**
```go
type Outer struct {
	InnerType // フィールド名を省略し、型名だけを記述
	OtherField string
}
```

## 埋め込みの効果: フィールドとメソッドの昇格

型 `InnerType` を `Outer` 構造体に埋め込むと、`InnerType` が持つ**エクスポートされたフィールド**と**メソッド**が、あたかも `Outer` 構造体自身のフィールドやメソッドであるかのように、`Outer` 型の変数から**直接アクセス**できるようになります。これをフィールドやメソッドの**昇格 (Promotion)** と呼びます。

内部的には、`Outer` 構造体は `InnerType` という名前のフィールドを持っているのと同じですが、Goが特別な扱いをして、`Outer` の変数から `InnerType` のフィールドやメソッドに直接アクセスできるようにしてくれます。

## コード例

```go title="構造体の埋め込みとフィールド/メソッドの昇格"
package main

import "fmt"

// --- 埋め込まれる側の型 ---
type Point struct {
	X, Y int
}

// Point 型のメソッド
func (p Point) Display() {
	fmt.Printf("[%d, %d]", p.X, p.Y)
}

// --- 埋め込む側の型 ---
type Circle struct {
	Point  // Point 型を匿名フィールドとして埋め込む
	Radius int
}

// Circle 型のメソッド
func (c Circle) Area() float64 {
	// 実際には math.Pi を使うべきだが、ここでは簡略化
	return 3.14 * float64(c.Radius*c.Radius)
}

func main() {
	// --- 埋め込みを使った初期化 ---
	// 方法1: ネストしたリテラル (フィールド名は型名)
	c1 := Circle{
		Point:  Point{X: 10, Y: 20}, // 埋め込まれた型の名前で初期化
		Radius: 5,
	}

	// 方法2: 昇格したフィールドを直接初期化 (リテラル内でも可能)
	c2 := Circle{
		Point:  Point{X: 1, Y: 1}, // Point を初期化しつつ...
		Radius: 3,
	}
	// c2.X = 1 // リテラル外でのアクセスは可能だが、リテラル内では通常ネストする
	// c2.Y = 1

	fmt.Printf("c1: %+v\n", c1)
	fmt.Printf("c2: %+v\n", c2)

	// --- 昇格したフィールドへのアクセス ---
	fmt.Println("\n--- 昇格したフィールド/メソッドへのアクセス ---")
	// c1.Point.X の代わりに c1.X で直接アクセスできる
	fmt.Printf("c1 の X座標: %d\n", c1.X)
	fmt.Printf("c1 の Y座標: %d\n", c1.Y)
	fmt.Printf("c1 の半径: %d\n", c1.Radius)

	// 埋め込まれた型の名前でもアクセス可能
	fmt.Printf("c1 の Point.X: %d\n", c1.Point.X)

	// --- 昇格したメソッドの呼び出し ---
	// Point 型の Display メソッドが Circle 型に昇格している
	fmt.Print("c1 の座標表示 (昇格したメソッド): ")
	c1.Display() // c1.Point.Display() と書かなくても良い
	fmt.Println()

	// Circle 型自身のメソッドも呼び出せる
	fmt.Printf("c1 の面積: %f\n", c1.Area())

	// --- フィールド名の衝突 ---
	// もし Circle にも X というフィールドがあった場合、
	// c1.X は Circle 自身の X フィールドを指し、
	// 埋め込まれた Point の X にアクセスするには c1.Point.X と書く必要がある。
}

/* 実行結果:
c1: {Point:{X:10 Y:20} Radius:5}
c2: {Point:{X:1 Y:1} Radius:3}

--- 昇格したフィールド/メソッドへのアクセス ---
c1 の X座標: 10
c1 の Y座標: 20
c1 の半径: 5
c1 の Point.X: 10
c1 の座標表示 (昇格したメソッド): [10, 20]
c1 の面積: 78.500000
*/
```

**コード解説:**

*   `type Circle struct { Point; Radius int }`: `Circle` 構造体に `Point` 型がフィールド名なしで記述されています。これが埋め込みです。
*   `c1 := Circle{ Point: Point{X: 10, Y: 20}, Radius: 5 }`: 埋め込みフィールドを初期化する際は、埋め込まれた型名をフィールド名のように使ってリテラルを記述します。
*   `fmt.Printf("c1 の X座標: %d\n", c1.X)`: `Point` 型のフィールド `X` が `Circle` 型に昇格しているため、`c1.Point.X` と書かずに `c1.X` で直接アクセスできています。`Y` も同様です。
*   `c1.Display()`: `Point` 型のメソッド `Display` も `Circle` 型に昇格しているため、`c1.Point.Display()` と書かずに `c1.Display()` で直接呼び出せています。

## 埋め込み vs ネスト

*   **ネスト (前のセクション):** フィールド名を明示的に指定します (`Dept Department`)。アクセスは `emp1.Dept.Name` のように連鎖させます。これは「〜が〜を持つ (has-a)」関係を表すのに適しています。
*   **埋め込み:** フィールド名を省略します (`Point`)。フィールドやメソッドが昇格し、直接アクセスできます (`c1.X`, `c1.Display()`)。これは「〜は〜の一種である (is-a)」の関係や、型の合成、コードの再利用（Mix-inのような使い方）に適しています。

構造体の埋め込みは、Goにおけるコードの再利用と構成のための強力なメカニズムですが、伝統的な継承とは異なる点（特にメソッドのオーバーライドの挙動など）に注意が必要です。