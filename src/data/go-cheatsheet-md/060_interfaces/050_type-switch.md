---
title: "インターフェース: 型スイッチ (Type Switch)"
tags: ["interfaces", "interface", "型スイッチ", "type switch", "switch"]
---

インターフェース変数に格納されている値の**具体的な型**に基づいて処理を分岐させたい場合、**型スイッチ (Type Switch)** を使います。これは `switch` 文の特殊な形式です。

型スイッチの詳しい構文と使い方は、**「制御構文」**セクションの**「型スイッチ (Type Switch)」**の項目 (`020_flow-control/150_type-switch.md`) を参照してください。

ここでは、`Shape` インターフェースの例を使って簡単に示します。

```go title="型スイッチの例 (Shape インターフェース)"
package main

import (
	"fmt"
	"math"
)

// --- インターフェースと型の定義 (再掲) ---
type Shape interface {
	Area() float64
}
type Rectangle struct { Width, Height float64 }
func (r Rectangle) Area() float64 { return r.Width * r.Height }
type Circle struct { Radius float64 }
func (c Circle) Area() float64 { return math.Pi * c.Radius * c.Radius }

// --- 型スイッチを使う関数 ---
func describeShape(s Shape) {
	fmt.Printf("入力: %v, ", s)
	switch v := s.(type) { // s の具体的な型をチェック
	case Rectangle:
		// v は Rectangle 型として扱える
		fmt.Printf("これは長方形です。幅=%.1f, 高さ=%.1f, 面積=%.2f\n", v.Width, v.Height, v.Area())
	case Circle:
		// v は Circle 型として扱える
		fmt.Printf("これは円です。半径=%.1f, 面積=%.2f\n", v.Radius, v.Area())
	case nil:
		fmt.Println("これは nil です。")
	default:
		// v は元の Shape 型
		fmt.Printf("これは未知の図形です (%T)。面積=%.2f\n", v, v.Area())
	}
}

func main() {
	var s Shape // nil インターフェース

	describeShape(s) // nil のケース

	s = Rectangle{Width: 5, Height: 4}
	describeShape(s) // Rectangle のケース

	s = Circle{Radius: 2.5}
	describeShape(s) // Circle のケース
}

/* 実行結果:
入力: <nil>, これは nil です。
入力: {5 4}, これは長方形です。幅=5.0, 高さ=4.0, 面積=20.00
入力: {2.5}, これは円です。半径=2.5, 面積=19.63
*/
```

型スイッチは、インターフェース変数に格納された値の型に応じて異なる処理を行いたい場合に非常に便利な構文です。