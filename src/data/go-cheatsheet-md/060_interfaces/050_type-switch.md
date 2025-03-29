## タイトル
title: 型スイッチ (Type Switch)

## タグ
tags: ["interfaces", "interface", "型スイッチ", "type switch", "switch"]

## コード
```go
package main

import (
	"fmt"
	"math"
)

type Shape interface{ Area() float64 }
type Rectangle struct{ Width, Height float64 }
func (r Rectangle) Area() float64 { return r.Width * r.Height }
type Circle struct{ Radius float64 }
func (c Circle) Area() float64 { return math.Pi * c.Radius * c.Radius }

// 型スイッチを使う関数
func describeShape(s Shape) {
	fmt.Printf("入力: %v, ", s)
	switch v := s.(type) { // 型スイッチ構文
	case Rectangle:
		// v は Rectangle 型
		fmt.Printf("長方形 (W:%.1f, H:%.1f), 面積:%.2f\n", v.Width, v.Height, v.Area())
	case Circle:
		// v は Circle 型
		fmt.Printf("円 (R:%.1f), 面積:%.2f\n", v.Radius, v.Area())
	case nil:
		fmt.Println("nil")
	default:
		// v は元の Shape 型
		fmt.Printf("未知の図形 (%T), 面積:%.2f\n", v, v.Area())
	}
}

func main() {
	var s Shape // nil
	describeShape(s)

	s = Rectangle{5, 4}
	describeShape(s)

	s = Circle{2.5}
	describeShape(s)
}

```

## 解説
```text
インターフェース変数に格納された値の**具体的な型**に
基づいて処理を分岐させたい場合、**型スイッチ**を使います。
これは `switch` 文の特殊な形式です。

**構文:**
```go
switch 変数 := インターフェース変数.(type) {
case 型1:
    // 変数 は 型1 として使える
case 型2:
    // 変数 は 型2 として使える
case nil:
    // インターフェース変数が nil の場合
default:
    // どの型にも一致しない場合
    // 変数 は元のインターフェース型
}
```
*   `インターフェース変数.(type)`: 型スイッチを示す特別な構文。
    `switch` の初期化ステートメントでのみ使用可。
*   `変数`: 各 `case` ブロック内で、判別された具体的な型の
    値を受け取る変数。
*   `case 型1:`: 値の型が `型1` かチェック。一致すれば
    このブロックが実行され、`変数` は `型1` として扱える。
*   `case nil:`: `nil` かチェック。
*   `default:`: どの型にも一致しない場合。

コード例の `describeShape` 関数では、引数 `s` ( `Shape` 型) の
具体的な型を `switch v := s.(type)` で判別しています。
`case Rectangle:` ブロック内では `v` は `Rectangle` 型として、
`case Circle:` ブロック内では `v` は `Circle` 型として
それぞれのフィールド (`v.Width`, `v.Radius`) にアクセスできます。

型スイッチは、インターフェース変数の具体的な型に応じて
異なる処理を行うための便利な構文です。