## タイトル
title: 関数 vs 基本的な違い

## タグ
tags: ["functions", "func", "メソッド", "method", "レシーバ", "型"]

## コード
```go
package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

// Point 型に関連付けられた Distance メソッド
// (p Point) がレシーバ
func (p Point) Distance(q Point) float64 {
	dx := q.X - p.X // p.X はレシーバ p の X 座標
	dy := q.Y - p.Y // p.Y はレシーバ p の Y 座標
	return math.Sqrt(dx*dx + dy*dy)
}

func main() {
	p1 := Point{1, 2}
	p2 := Point{4, 6}

	// メソッド呼び出し: p1 に対して Distance メソッドを呼び出す
	dist := p1.Distance(p2)
	fmt.Printf("p1.Distance(p2) = %f\n", dist) // 5.000000
}

```

## 解説
```text
Goには**関数 (Function)** と、特定の**型**に関連付けられた
**メソッド (Method)** があります。

**関数 (Function):**
*   特定の型に関連付けられず、独立して存在する。
*   `パッケージ名.関数名()` または `関数名()` で呼び出す。

**メソッド (Method):**
*   特定の型（**レシーバ型**）に関連付けられる。
    (構造体が多いが、他の型にも定義可能)
*   定義時に**レシーバ**を指定する。
    `func (レシーバ名 レシーバ型) メソッド名(...) ...`
*   レシーバ型の**値**に対して呼び出す。
    `変数.メソッド名(...)`
*   メソッド内ではレシーバ変数を使って値にアクセスできる。

コード例では `Point` 型を定義し、その型に対する
`Distance` メソッドを定義しています。
`func (p Point) Distance(...)` の `(p Point)` がレシーバです。
`main` 関数では `Point` 型の変数 `p1` に対して
`p1.Distance(p2)` のようにメソッドを呼び出しています。
メソッド内部ではレシーバ `p` を通して `p1` の座標 (`p.X`, `p.Y`) に
アクセスしています。

(比較: 通常の関数なら `func distanceFunc(p1, p2 Point) float64`
のように定義し、`distanceFunc(p1, p2)` と呼び出す)

**使い分け:**
*   **関数:** 型に依存しない汎用処理、ユーティリティ。
*   **メソッド:** 特定の型のデータ操作、型の振る舞いの定義。
    オブジェクト指向的な設計で中心となる。

メソッドは型に振る舞いを持たせ、コードを構造化する上で重要です。