## タイトル
title: ゼロ値 (Zero Value)

## タグ
tags: ["basic-types", "ゼロ値", "初期化", "nil"]

## コード
```go
package main

import "fmt"

type Point struct {
	X, Y int
}

func main() {
	var i int
	var f float64
	var b bool
	var s string
	var p *int // ポインタ
	var slice []int
	var mp map[string]int
	var pt Point // 構造体

	fmt.Printf("int:     %d\n", i)
	fmt.Printf("float64: %f\n", f)
	fmt.Printf("bool:    %t\n", b)
	fmt.Printf("string:  \"%s\"\n", s)
	fmt.Printf("pointer: %v\n", p)
	fmt.Printf("slice:   %v (len=%d)\n", slice, len(slice))
	fmt.Printf("map:     %v (len=%d)\n", mp, len(mp))
	fmt.Printf("struct:  %+v\n", pt)
}
```

## 解説
```text
Goの**ゼロ値 (Zero Value)** は、変数を宣言した際に
明示的に初期値を指定しなかった場合に、
自動的に設定されるデフォルト値です。

**なぜ重要か？**
Goでは**すべての型にゼロ値が定義**されており、
`var` で宣言された変数は必ず有効な値を持ちます。
これにより、変数が未定義の状態 (`null` や `undefined`) に
なることがなく、コードの安全性が向上します。

**主要な型のゼロ値:**
*   数値型 (`int`, `float64` 等): `0` または `0.0`
*   `bool`: `false`
*   `string`: `""` (空文字列)
*   ポインタ (`*int` 等): `nil`
*   インターフェース (`error` 等): `nil`
*   スライス (`[]int` 等): `nil`
*   マップ (`map[string]int` 等): `nil`
*   チャネル (`chan int` 等): `nil`
*   関数 (`func()` 等): `nil`
*   構造体 (`struct`): 全フィールドがそれぞれのゼロ値で
    初期化された状態 (例: `{X:0 Y:0}`)。**`nil` ではない**。

**`nil` について:**
ポインタ、インターフェース、スライス、マップ、
チャネル、関数といった**参照型**のゼロ値です。
「有効な参照先が存在しない」状態を示します。
`nil` のスライスやマップに要素を追加しようとすると
エラーになることがあるため、通常は `make()` などで
初期化してから使います。