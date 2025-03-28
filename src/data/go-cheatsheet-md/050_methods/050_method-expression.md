---
title: "メソッド: メソッド式 (Method Expression)"
tags: ["methods", "メソッド式", "関数型", "レシーバ"]
---

通常、メソッドは `変数.メソッド名(引数)` のように、特定の型の値（レシーバ）に対して呼び出します。しかし、Goには**メソッド式 (Method Expression)** という構文があり、これを使うとメソッドを**通常の関数**のように扱うことができます。

## メソッド式とは？

メソッド式は、メソッドを、そのレシーバを**第一引数**として受け取る通常の関数値に変換します。

**構文:** `レシーバ型名.メソッド名` (例: `Point.Distance`)

*   `レシーバ型名`: メソッドが定義されている型（例: `Point`）。ポインタレシーバのメソッドの場合は `(*Point)` のように書くこともありますが、通常は型名だけで大丈夫です（次のセクションで詳述）。
*   `メソッド名`: 呼び出したいメソッドの名前。

このメソッド式 `T.MethodName` は、以下のような関数型の値になります。

*   **値レシーバ `func (recv T) MethodName(args...) ...` の場合:**
    `func(recv T, args...) ...` という型の関数値になります。第一引数にレシーバの値 `T` を取ります。
*   **ポインタレシーバ `func (recv *T) MethodName(args...) ...` の場合:**
    `func(recv *T, args...) ...` という型の関数値になります。第一引数にレシーバのポインタ `*T` を取ります。

## コード例

`Point` 型の `Distance` メソッド（値レシーバ）を例に見てみましょう。

```go title="メソッド式の使い方 (値レシーバ)"
package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

// Distance メソッド (値レシーバ)
func (p Point) Distance(q Point) float64 {
	fmt.Printf("  (Distanceメソッド内: レシーバ p=%+v, 引数 q=%+v)\n", p, q)
	dx := q.X - p.X
	dy := q.Y - p.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func main() {
	p := Point{1, 2}
	q := Point{4, 6}

	// --- 通常のメソッド呼び出し ---
	fmt.Println("--- 通常のメソッド呼び出し ---")
	dist1 := p.Distance(q) // レシーバ p に対して Distance を呼び出す
	fmt.Printf("p.Distance(q) = %f\n", dist1)

	// --- メソッド式 ---
	fmt.Println("\n--- メソッド式 ---")
	// メソッド式 Point.Distance は func(Point, Point) float64 型の関数値になる
	distanceFunc := Point.Distance
	fmt.Printf("メソッド式の型: %T\n", distanceFunc)

	// メソッド式を関数として呼び出す
	// 最初の引数にレシーバとなる値 (p) を渡す
	// 2番目以降の引数にメソッドの通常の引数 (q) を渡す
	dist2 := distanceFunc(p, q) // distanceFunc(レシーバ, 引数)
	fmt.Printf("distanceFunc(p, q) = %f\n", dist2)

	// メソッド式を直接呼び出すことも可能
	dist3 := Point.Distance(p, q)
	fmt.Printf("Point.Distance(p, q) = %f\n", dist3)

	// メソッド式を変数に代入せずに関数引数として渡すこともできる
	// (例: apply 関数が func(Point, Point) float64 型の関数を要求する場合)
	// result := apply(Point.Distance, p, q)
}

/* 実行結果:
--- 通常のメソッド呼び出し ---
  (Distanceメソッド内: レシーバ p={X:1 Y:2}, 引数 q={X:4 Y:6})
p.Distance(q) = 5.000000

--- メソッド式 ---
メソッド式の型: func(main.Point, main.Point) float64
  (Distanceメソッド内: レシーバ p={X:1 Y:2}, 引数 q={X:4 Y:6})
distanceFunc(p, q) = 5.000000
  (Distanceメソッド内: レシーバ p={X:1 Y:2}, 引数 q={X:4 Y:6})
Point.Distance(p, q) = 5.000000
*/
```

**コード解説:**

*   `distanceFunc := Point.Distance`: `Point` 型の `Distance` メソッドに対するメソッド式を取得し、変数 `distanceFunc` に代入しています。`distanceFunc` は `func(main.Point, main.Point) float64` という関数型になります。
*   `dist2 := distanceFunc(p, q)`: `distanceFunc` を通常の関数として呼び出しています。**最初の引数 `p` がメソッドのレシーバ**として扱われ、2番目の引数 `q` がメソッドの通常の引数として渡されます。これは `p.Distance(q)` と同じ処理を実行します。
*   `dist3 := Point.Distance(p, q)`: メソッド式を直接呼び出すことも可能です。

## メソッド式の用途

メソッド式は、通常のメソッド呼び出しほど頻繁には使われませんが、以下のような場合に役立ちます。

*   **関数を引数として渡す:** ある型のメソッドを、関数型の引数を受け取る別の関数（高階関数）に渡したい場合。メソッド式を使うことで、メソッドを適切なシグネチャを持つ関数値に変換できます。
*   **メソッドの実装を切り替え可能にする:** メソッド式を変数に代入しておき、後でその変数に別の（同じシグネチャを持つ）関数やメソッド式を代入することで、動作を切り替える。

メソッド式は、メソッドをより柔軟に関数値として扱うための機能です。次のセクションでは、ポインタレシーバメソッドに対するメソッド式を見ていきます。