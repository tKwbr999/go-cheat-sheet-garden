## タイトル
title: 構造体 (Struct) の値（インスタンス）の作成

## タグ
tags: ["data-structures", "構造体", "struct", "初期化", "リテラル", "new", "ポインタ"]

## コード
```go
package main

import "fmt"

type Point struct{ X, Y int }

type Circle struct {
	Center Point
	Radius int
	Label  string
}

func main() {
	// フィールド名を指定して初期化 (推奨)
	p1 := Point{X: 10, Y: 20}
	fmt.Printf("p1: %+v\n", p1)

	// 順序は任意
	p2 := Point{Y: 50, X: 30}
	fmt.Printf("p2: %+v\n", p2)

	// 一部フィールドのみ初期化 (Y はゼロ値 0)
	p3 := Point{X: 100}
	fmt.Printf("p3: %+v\n", p3)

	// ネストした構造体の初期化
	c1 := Circle{
		Center: Point{X: 5, Y: 5},
		Radius: 10,
		Label:  "My Circle", // 最後のカンマ推奨
	}
	fmt.Printf("c1: %+v\n", c1)
}

```

## 解説
```text
構造体型の**値（インスタンス）**を作成・初期化するには、
主に**構造体リテラル**を使います (`型名{}`)。

**方法1: フィールド名を指定 (推奨)**
`変数 := 型名{フィールド名1: 値1, フィールド名2: 値2, ...}`
*   `フィールド名: 値` の形式で指定。
*   フィールドの**順序は任意**。
*   一部フィールドのみ初期化可能 (他はゼロ値)。
*   **推奨:** 読みやすく、構造体定義の変更に強い。
*   最後のフィールドの後にもカンマ `,` を付けるのが Go のスタイル。

コード例では `p1`, `p2`, `p3`, `c1` がこの方法で
作成されています。`c1` ではネストした `Point` も
リテラルで初期化しています。

**方法2: フィールド名を省略 (非推奨)**
`変数 := 型名{値1, 値2, ...}`
*   構造体定義の**フィールドと同じ順序**で**すべての値**を指定。
*   **非推奨:** 定義変更に弱く、可読性が低い。

**`new(T)` 関数によるポインタ作成**
`変数 := new(構造体名)`
*   指定した型の**ゼロ値**で初期化された値を作成し、
    その値への**ポインタ (`*構造体名`)** を返します。
*   フィールドは後から `ptr.Field = value` のように設定します。

**構造体リテラルと `&` によるポインタ作成**
`変数 := &構造体名{フィールド名1: 値1, ...}`
*   リテラルで指定した値で初期化された構造体を作成し、
    その値への**ポインタ (`*構造体名`)** を返します。
*   初期値を指定したい場合は `new` よりこちらが一般的です。

構造体作成は、フィールド名指定のリテラル (`T{...}`) が
最も安全で推奨されます。ポインタが必要なら `&T{...}` を使います。