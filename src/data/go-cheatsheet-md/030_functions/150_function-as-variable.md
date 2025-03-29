## タイトル
title: 関数: 関数を変数に代入する

## タグ
tags: ["functions", "func", "関数型", "変数", "第一級オブジェクト", "関数リテラル"]

## コード
```go
package main

import "fmt"

func add(a, b int) int {
	return a + b
}

// 関数型を定義 (オプション)
type BinaryIntOperator func(int, int) int

func main() {
	// 関数型の変数を宣言し、関数名を代入
	var operation BinaryIntOperator
	operation = add // シグネチャが一致すれば代入可能

	// 変数 operation を使って add 関数を呼び出す
	result1 := operation(10, 5)
	fmt.Printf("operation(10, 5) = %d\n", result1) // 15

	// 関数リテラル (無名関数) を変数に代入
	greet := func(name string) string {
		return "Hello, " + name + "!"
	}
	message := greet("Gopher")
	fmt.Println(message) // Hello, Gopher!
}

```

## 解説
```text
Goでは関数は**第一級オブジェクト**であり、
他の値と同じように扱えます。
*   **変数に代入できる**
*   関数の引数として渡せる
*   関数の戻り値として返せる

ここでは**関数を変数に代入する**方法を見ます。

**関数型の変数:**
関数を代入するには、その関数の型（シグネチャ）に
合った**関数型の変数**を宣言します。
`var 変数名 func(引数リスト) 戻り値リスト`
または `type` で定義した関数型名を使います。
`type MyFunc func(...) ...`
`var 変数名 MyFunc`

**関数や関数リテラルの代入:**
宣言した変数には、シグネチャが一致する
**通常の関数名** (例: `add`) や、
その場で定義する**関数リテラル（無名関数）**
(例: `func(name string) { ... }`) を代入できます。

代入後は、その**変数名を使って関数を呼び出す**
ことができます (例: `operation(10, 5)`, `greet("Gopher")`)。

関数型の変数のゼロ値は `nil` です。`nil` の関数変数を
呼び出すとパニックになります。

**利点:**
*   **処理の切り替え:** 変数に代入する関数を変える。
*   **関数のコレクション:** 関数をスライスやマップで管理。
*   **高階関数:** 関数を引数や戻り値にする (次以降)。

関数を値として扱えることはGoの柔軟性を高めます。