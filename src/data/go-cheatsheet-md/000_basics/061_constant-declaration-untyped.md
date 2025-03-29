## タイトル
title: 型無し定数 (Untyped Constant): 柔軟な型解釈

## タグ
tags: ["basics", "定数", "const", "型無し定数", "untyped"]

## コード
```go
package main

import "fmt"

const UntypedInt = 100     // 型無し整数定数
const UntypedFloat = 3.14   // 型無し浮動小数点定数
const UntypedString = "hello" // 型無し文字列定数

func main() {
	var i int = UntypedInt       // OK: int に代入可能
	var f64 float64 = UntypedInt // OK: float64 に代入可能 (100.0)
	var f32 float32 = UntypedFloat // OK: float32 に代入可能
	var s string = UntypedString // OK: string に代入可能

	fmt.Println(i, f64, f32, s) // 100 100 3.14 hello

	const TypedInt int = 200 // 型付き整数定数
	// var f float64 = TypedInt // コンパイルエラー: 型が違うため代入不可
}

```

## 解説
```text
型を省略して宣言された定数は「型無し定数 (Untyped Constant)」と呼ばれます。
例: `const UntypedInt = 100`

型無し定数は特定の型に縛られず、使われる文脈（代入先の変数の型など）に応じて適切な型として解釈される柔軟性を持っています。

コード例のように、型無し整数定数 `UntypedInt` は `int` 型の変数 `i` にも `float64` 型の変数 `f64` にも代入できます (`100.0` として扱われます)。

一方、型を明示して宣言された「型付き定数」(例: `const TypedInt int = 200`) は、その型として扱われ、互換性のない型へは直接代入できません (例: `var f float64 = TypedInt` はエラー)。

この柔軟性により、型無し定数は数値リテラルのように扱いやすくなります。