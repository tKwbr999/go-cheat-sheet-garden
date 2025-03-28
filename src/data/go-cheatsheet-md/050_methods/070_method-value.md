---
title: "メソッド: メソッド値 (Method Value)"
tags: ["methods", "メソッド値", "関数型", "レシーバ", "クロージャ"]
---

メソッド式 (`T.MethodName`) はメソッドをレシーバを第一引数に取る関数値に変換しましたが、Goにはもう一つ、メソッドを関数値として扱う方法があります。それが**メソッド値 (Method Value)** です。

## メソッド値とは？

メソッド値は、**特定のレシーバ値**に対してメソッドを呼び出す操作を、関数値として取得するものです。メソッド式とは異なり、メソッド値は**レシーバを引数として取りません**。なぜなら、メソッド値が作成される時点で、どのレシーバに対してメソッドを実行するかが既に**決まっている（バインドされている）**からです。

**構文:** `レシーバ変数名.メソッド名` (例: `p.Distance`)

*   `レシーバ変数名`: メソッドを呼び出す対象となる具体的な値（変数）。
*   `メソッド名`: 呼び出すメソッドの名前。

このメソッド値 `v.MethodName` は、以下のような関数型の値になります。

*   元のメソッドが `func (recv T) MethodName(args...) ...` の場合:
    `func(args...) ...` という型の関数値になります（レシーバ `T` は引数に含まれない）。
*   元のメソッドが `func (recv *T) MethodName(args...) ...` の場合:
    `func(args...) ...` という型の関数値になります（レシーバ `*T` は引数に含まれない）。

メソッド値は、特定のレシーバに紐付いたメソッド呼び出しをカプセル化したクロージャと考えることもできます。

## コード例

`Point` 型の `Distance` メソッド（値レシーバ）と `Counter` 型の `Increment` メソッド（ポインタレシーバ）を例に見てみましょう。

```go title="メソッド値の使い方"
package main

import (
	"fmt"
	"math"
)

// --- Point 型と Distance メソッド (値レシーバ) ---
type Point struct {
	X, Y float64
}

func (p Point) Distance(q Point) float64 {
	dx := q.X - p.X
	dy := q.Y - p.Y
	return math.Sqrt(dx*dx + dy*dy)
}

// --- Counter 型と Increment メソッド (ポインタレシーバ) ---
type Counter struct {
	count int
}

func (c *Counter) Increment() {
	if c == nil { return }
	c.count++
}

func main() {
	p := Point{1, 2}
	q := Point{4, 6}
	c := &Counter{count: 10} // ポインタ変数

	// --- メソッド値 (値レシーバメソッドから) ---
	fmt.Println("--- メソッド値 (値レシーバ) ---")
	// p.Distance は、レシーバ p にバインドされた Distance メソッドを表す関数値
	// 型は func(Point) float64 (元のメソッドの引数のみ)
	distanceFromP := p.Distance
	fmt.Printf("メソッド値の型: %T\n", distanceFromP)

	// メソッド値を関数として呼び出す (レシーバ p は既に含まれている)
	// 引数にはメソッドの通常の引数 (q) のみを渡す
	dist := distanceFromP(q) // p.Distance(q) と同じ
	fmt.Printf("distanceFromP(q) = %f\n", dist)

	// --- メソッド値 (ポインタレシーバメソッドから) ---
	fmt.Println("\n--- メソッド値 (ポインタレシーバ) ---")
	// c.Increment は、レシーバ c (*Counter) にバインドされた Increment メソッドを表す関数値
	// 型は func() (元のメソッドの引数なし)
	incrementC := c.Increment
	fmt.Printf("メソッド値の型: %T\n", incrementC)

	// メソッド値を関数として呼び出す (引数なし)
	incrementC() // c.Increment() と同じ
	fmt.Printf("incrementC() 後の c.count: %d\n", c.count) // 11

	incrementC() // 再度呼び出す
	fmt.Printf("incrementC() 後の c.count: %d\n", c.count) // 12

	// --- メソッド式との比較 ---
	fmt.Println("\n--- メソッド式との比較 ---")
	// メソッド式 (レシーバを第一引数に取る関数)
	distanceFunc := Point.Distance // func(Point, Point) float64
	distExpr := distanceFunc(p, q)
	fmt.Printf("メソッド式呼び出し: %f\n", distExpr)

	// メソッド値 (レシーバ p がバインド済み)
	distanceVal := p.Distance // func(Point) float64
	distVal := distanceVal(q)
	fmt.Printf("メソッド値呼び出し: %f\n", distVal)
}

/* 実行結果:
--- メソッド値 (値レシーバ) ---
メソッド値の型: func(main.Point) float64
distanceFromP(q) = 5.000000

--- メソッド値 (ポインタレシーバ) ---
メソッド値の型: func()
incrementC() 後の c.count: 11
incrementC() 後の c.count: 12

--- メソッド式との比較 ---
メソッド式呼び出し: 5.000000
メソッド値呼び出し: 5.000000
*/
```

**コード解説:**

*   `distanceFromP := p.Distance`: 変数 `p` (`Point` 型) に対して `Distance` メソッドを指定しています。これにより、`p` をレシーバとして `Distance` を呼び出す関数値が `distanceFromP` に代入されます。`distanceFromP` の型は `func(Point) float64` となり、元のメソッドの引数 `q Point` のみが引数リストに残ります。
*   `dist := distanceFromP(q)`: `distanceFromP` を呼び出す際には、レシーバ `p` は既にバインドされているため、通常の引数 `q` だけを渡します。これは内部的に `p.Distance(q)` を実行するのと同じです。
*   `incrementC := c.Increment`: 変数 `c` (`*Counter` 型) に対して `Increment` メソッドを指定しています。`incrementC` には `c` をレシーバとして `Increment` を呼び出す関数値が代入されます。`incrementC` の型は `func()` となり、元のメソッドに引数がないため、引数リストは空になります。
*   `incrementC()`: `incrementC` を呼び出すと、バインドされたレシーバ `c` に対して `Increment` メソッドが実行されます。

## メソッド値の用途

メソッド値は、特定のオブジェクト（レシーバ）のメソッドを、後で実行するためにコールバック関数として渡したい場合などに便利です。メソッド式ではレシーバも一緒に渡す必要がありますが、メソッド値なら関数値だけを渡せば、呼び出し時に自動的に正しいレシーバに対して実行されます。

例えば、ボタンクリック時に特定のオブジェクトのメソッドを呼び出す、といったシナリオで使えます。

```go
// 擬似コード
button.OnClick = myObject.HandleClick // myObject の HandleClick メソッドをコールバックとして設定
```

メソッド値とメソッド式は、どちらもメソッドを関数値として扱う方法ですが、レシーバの扱い方が異なります。状況に応じて適切な方を選びましょう。