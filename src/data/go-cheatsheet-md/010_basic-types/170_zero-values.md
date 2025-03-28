---
title: "基本の型: ゼロ値 (Zero Value)"
tags: ["basic-types", "ゼロ値", "初期化", "nil"]
---

Go言語の重要な特徴の一つに、**ゼロ値 (Zero Value)** の概念があります。これは、変数を宣言した際に明示的に初期値を指定しなかった場合に、その変数に自動的に設定されるデフォルトの値のことです。

## ゼロ値とは？ なぜ重要か？

他の多くのプログラミング言語では、初期化されていない変数は `null` や `undefined` といった特別な状態になることがあり、これが予期せぬエラー（特に `null` ポインタ参照エラー）の原因となることがあります。

Goでは、**すべての型に対してゼロ値が定義されています**。これにより、`var` で宣言された変数は、初期値を指定しなくても、必ずその型の「ゼロ」を表す有効な値を持ちます。これにより、変数が未定義の状態になることがなくなり、コードの安全性が向上します。

## 主要な型のゼロ値

以下に、主要な型のゼロ値をまとめます。

*   **数値型 (Numeric Types):**
    *   `int`, `int8`, `int16`, `int32`, `int64`: `0`
    *   `uint`, `uint8` (`byte`), `uint16`, `uint32`, `uint64`, `uintptr`: `0`
    *   `float32`, `float64`: `0.0`
    *   `complex64`, `complex128`: `(0+0i)`
*   **真偽値型 (Boolean Type):**
    *   `bool`: `false`
*   **文字列型 (String Type):**
    *   `string`: `""` (空文字列)
*   **ポインタ型 (Pointer Types):**
    *   `*int`, `*string`, etc.: `nil`
*   **インターフェース型 (Interface Types):**
    *   `error`, `interface{}`, etc.: `nil`
*   **スライス型 (Slice Types):**
    *   `[]int`, `[]string`, etc.: `nil`
*   **マップ型 (Map Types):**
    *   `map[string]int`, etc.: `nil`
*   **チャネル型 (Channel Types):**
    *   `chan int`, etc.: `nil`
*   **関数型 (Function Types):**
    *   `func()`, `func(int) string`, etc.: `nil`
*   **構造体型 (Struct Types):**
    *   構造体のゼロ値は、その**すべてのフィールドがそれぞれのゼロ値**で初期化された状態になります。`nil` ではありません。

**`nil` について:**

`nil` は、ポインタ、インターフェース、スライス、マップ、チャネル、関数型といった**参照型**のゼロ値を表す特別な識別子です。これは「有効な参照先が存在しない」状態を示します。`nil` のスライスやマップに対して要素を追加しようとするとエラーになる場合があるため注意が必要です（通常は `make()` などで初期化してから使います）。

## ゼロ値の確認例

```go title="各型のゼロ値を確認する"
package main

import "fmt"

// 構造体の定義
type Point struct {
	X, Y int
}

func main() {
	// 各型の変数を初期値なしで宣言
	var i int
	var f float64
	var b bool
	var s string
	var p *int // int 型へのポインタ
	var slice []int
	var mp map[string]int
	var ch chan bool
	var fn func(int) int
	var err error // error はインターフェース型
	var pt Point // 構造体

	fmt.Printf("int:       %d\n", i)
	fmt.Printf("float64:   %f\n", f)
	fmt.Printf("bool:      %t\n", b)
	fmt.Printf("string:    \"%s\"\n", s) // ダブルクォートで囲んで空文字列を分かりやすく表示
	fmt.Printf("pointer:   %v\n", p)   // ポインタのゼロ値は nil
	fmt.Printf("slice:     %v (len=%d, cap=%d)\n", slice, len(slice), cap(slice)) // nil スライス (長さも容量も0)
	fmt.Printf("map:       %v (len=%d)\n", mp, len(mp)) // nil マップ (要素数は0)
	fmt.Printf("channel:   %v\n", ch)  // nil チャネル
	fmt.Printf("function:  %v\n", fn)  // nil 関数
	fmt.Printf("interface: %v\n", err) // nil インターフェース
	fmt.Printf("struct:    %+v\n", pt)  // フィールドがゼロ値で初期化される ({X:0 Y:0})
}

/* 実行結果:
int:       0
float64:   0.000000
bool:      false
string:    ""
pointer:   <nil>
slice:     [] (len=0, cap=0)
map:       map[] (len=0)
channel:   <nil>
function:  <nil>
interface: <nil>
struct:    {X:0 Y:0}
*/
```

Goのゼロ値の仕組みにより、変数は常に初期化された状態から始まるため、より安全で予測可能なコードを書くことができます。