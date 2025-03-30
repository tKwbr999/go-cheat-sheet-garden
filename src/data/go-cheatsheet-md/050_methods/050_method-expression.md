## タイトル
title: メソッド式 (Method Expression)

## タグ
tags: ["methods", "メソッド式", "関数型", "レシーバ"]

## コード
```go
package main

import (
	"fmt"
	"math"
)

type Point struct{ X, Y float64 }

// Distance メソッド (値レシーバ)
func (p Point) Distance(q Point) float64 {
	fmt.Printf("  (Distance: p=%+v, q=%+v)\n", p, q)
	dx := q.X - p.X
	dy := q.Y - p.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func main() {
	p := Point{1, 2}
	q := Point{4, 6}

	// メソッド式: 型名.メソッド名
	// Point.Distance は func(Point, Point) float64 型の関数値
	distanceFunc := Point.Distance
	fmt.Printf("メソッド式の型: %T\n", distanceFunc)

	// メソッド式を関数として呼び出す
	// 第1引数にレシーバ (p)、第2引数以降にメソッド引数 (q)
	dist := distanceFunc(p, q)
	fmt.Printf("distanceFunc(p, q) = %f\n", dist) // 5.0

	// 通常のメソッド呼び出し: p.Distance(q)
}

```

## 解説
```text
通常メソッドは `変数.メソッド名()` で呼び出しますが、
**メソッド式 (Method Expression)** を使うと、
メソッドを**通常の関数**のように扱えます。

**構文:** `レシーバ型名.メソッド名`
例: `Point.Distance`

これは、メソッドのレシーバを**第一引数**として受け取る
通常の関数値に変換します。

*   **値レシーバ `func (recv T) M(args...)` の場合:**
    メソッド式 `T.M` は `func(recv T, args...)` 型の関数値になる。
*   **ポインタレシーバ `func (recv *T) M(args...)` の場合:**
    メソッド式 `T.M` (または `(*T).M`) は
    `func(recv *T, args...)` 型の関数値になる。

コード例では `Point.Distance` というメソッド式を変数
`distanceFunc` に代入しています。
`distanceFunc` の型は `func(main.Point, main.Point) float64` となり、
レシーバ (`Point`) が第一引数になっています。

`distanceFunc(p, q)` のように呼び出すと、`p` がレシーバ、
`q` がメソッドの引数として `Distance` メソッドが実行されます。
これは通常のメソッド呼び出し `p.Distance(q)` と同じ結果になります。

**用途:**
メソッド式は頻繁には使いませんが、以下の場合に役立ちます。
*   **高階関数への引数:** ある型のメソッドを、関数型の引数を
    受け取る別の関数に渡したい場合。
*   **実装切り替え:** メソッド式を変数に代入し、後で
    別の関数やメソッド式を再代入して動作を変える。

メソッド式は、メソッドをより柔軟に関数値として扱うための機能です。