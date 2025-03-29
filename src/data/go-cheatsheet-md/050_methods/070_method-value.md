## タイトル
title: メソッド: メソッド値 (Method Value)

## タグ
tags: ["methods", "メソッド値", "関数型", "レシーバ", "クロージャ"]

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
	dx := q.X - p.X
	dy := q.Y - p.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func main() {
	p := Point{1, 2}
	q := Point{4, 6}

	// メソッド値: 変数 p にバインドされた Distance メソッド
	// 型は func(Point) float64 (レシーバ引数なし)
	distanceFromP := p.Distance
	fmt.Printf("メソッド値の型: %T\n", distanceFromP)

	// メソッド値を関数として呼び出す (引数は q のみ)
	dist := distanceFromP(q) // 実質的に p.Distance(q) が実行される
	fmt.Printf("distanceFromP(q) = %f\n", dist)
}

```

## 解説
```text
メソッドを関数値として扱うもう一つの方法が
**メソッド値 (Method Value)** です。

**メソッド値とは？**
**特定のレシーバ値**に対してメソッド呼び出しを行う操作を、
関数値として取得します。メソッド式 (`T.MethodName`) と異なり、
メソッド値は**レシーバを引数に取りません**。
なぜなら、メソッド値作成時点でどのレシーバで実行するかが
**決まっている（バインドされている）**からです。

**構文:** `レシーバ変数名.メソッド名`
例: `p.Distance`

これは、元のメソッドのシグネチャからレシーバ引数を除いた
関数型の値になります。
*   `func (recv T) M(args...)` -> `func(args...)`
*   `func (recv *T) M(args...)` -> `func(args...)`

メソッド値は、特定のレシーバに紐付いたメソッド呼び出しを
カプセル化したクロージャと考えることもできます。

コード例では `distanceFromP := p.Distance` で、
変数 `p` をレシーバとする `Distance` メソッドのメソッド値を取得しています。
`distanceFromP` の型は `func(Point) float64` となり、
レシーバ引数 `p Point` がなくなっています。
`distanceFromP(q)` と呼び出すと、バインドされた `p` をレシーバとして
`p.Distance(q)` が実行されます。

同様に、ポインタレシーバメソッド `c.Increment` (型 `func()`) も
メソッド値として取得できます。

**メソッド式 vs メソッド値:**
*   **メソッド式 (`T.MethodName`)**: レシーバを第一引数に取る関数。
    呼び出し時にレシーバを指定する必要がある。
*   **メソッド値 (`v.MethodName`)**: 特定のレシーバ `v` に
    バインドされた関数。呼び出し時にレシーバ指定は不要。

**用途:**
特定のオブジェクト（レシーバ）のメソッドを、後で実行するために
コールバック関数として渡したい場合に便利です。
メソッド値だけ渡せば、呼び出し時に正しいレシーバで実行されます。
例: `button.OnClick = myObj.HandleClick`