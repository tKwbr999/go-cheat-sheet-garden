---
title: "基本の型: 数値型間の明示的な変換"
tags: ["basic-types", "型変換", "キャスト", "int", "float64", "uint"]
---

Go言語は**静的型付け言語**であり、型の安全性を重視しています。そのため、異なる数値型（例えば `int` と `float64`）の間で値を代入したり、演算したりする際には、**明示的な型変換 (Explicit Type Conversion)** が必要になります。他の言語のように自動的に型が変換される（暗黙の型変換）ことはありません。

## なぜ明示的な変換が必要か？

これは、意図しないデータの損失や予期せぬ挙動を防ぐためです。例えば、浮動小数点数を整数に変換すると小数点以下が切り捨てられます。また、大きなサイズの型から小さなサイズの型へ変換すると、値が収まらずにオーバーフローする可能性があります。Goでは、プログラマがこれらの変換を意識的に行うことを要求します。

## 型変換の構文: `T(v)`

型 `T` の値に変換したい値 `v` がある場合、`T(v)` という構文で型変換を行います。

```go title="数値型間の明示的な変換例"
package main

import (
	"fmt"
	"math"
)

func main() {
	var i int = 100
	var f float64 = 3.14
	var u uint = 50
	var i64 int64 = 1234567890
	var i8 int8 // -128 〜 127

	// --- 異なる型同士の演算には変換が必要 ---
	// fmt.Println(i + f) // コンパイルエラー: invalid operation: i + f (mismatched types int and float64)

	// int を float64 に変換してから加算
	result1 := float64(i) + f
	fmt.Printf("%d (%T) + %f (%T) = %f (%T)\n", i, i, f, f, result1, result1)

	// float64 を int に変換してから加算 (小数点以下は切り捨てられる！)
	result2 := i + int(f) // int(3.14) は 3 になる
	fmt.Printf("%d (%T) + %f (%T) -> %d (%T) + %d (%T) = %d (%T)\n", i, i, f, f, i, i, int(f), int(f), result2, result2)

	// --- 異なる型への代入にも変換が必要 ---
	// var f2 float64 = i // コンパイルエラー: cannot use i (variable of type int) as float64 value in variable declaration
	var f2 float64 = float64(i) // OK
	fmt.Printf("\nint から float64 への代入: %f (%T)\n", f2, f2)

	// var u2 uint = i // コンパイルエラー (int と uint は異なる型)
	var u2 uint = uint(i) // OK (i が負でない場合)
	fmt.Printf("int から uint への代入: %d (%T)\n", u2, u2)

	// --- 変換時の注意点 ---

	// 1. 精度低下 (float -> int)
	var largeFloat float64 = 123.789
	var intFromFloat int = int(largeFloat) // 小数点以下が切り捨てられる
	fmt.Printf("\nfloat64(%f) -> int(%d)\n", largeFloat, intFromFloat)

	// 2. オーバーフロー (大きな型 -> 小さな型)
	// int64 の値を int8 に変換しようとする
	// i64 の値 (1234567890) は int8 (-128〜127) の範囲を超える
	// i8 = int8(i64) // 実行時の挙動は未定義に近い (多くの場合、値がラップアラウンドする)
	// fmt.Printf("int64(%d) -> int8(%d)\n", i64, i8) // 予期しない値になる可能性が高い！

	// 安全な変換のためには、範囲チェックが必要な場合がある
	if i64 >= math.MinInt8 && i64 <= math.MaxInt8 {
		i8 = int8(i64)
		fmt.Printf("int64(%d) は int8(%d) に安全に変換できました。\n", i64, i8)
	} else {
		fmt.Printf("警告: int64(%d) は int8 の範囲外です。\n", i64)
	}
}

/* 実行結果:
100 (int) + 3.140000 (float64) = 103.140000 (float64)
100 (int) + 3.140000 (float64) -> 100 (int) + 3 (int) = 103 (int)

int から float64 への代入: 100.000000 (float64)
int から uint への代入: 100 (uint)

float64(123.789000) -> int(123)
警告: int64(1234567890) は int8 の範囲外です。
*/
```

**コード解説:**

*   `float64(i)`: `int` 型の変数 `i` の値を `float64` 型に変換しています。
*   `int(f)`: `float64` 型の変数 `f` の値を `int` 型に変換しています。この際、小数点以下は**切り捨て**られます。
*   `uint(i)`: `int` 型の変数 `i` の値を `uint` 型に変換しています。`i` が負の値の場合、予期しない結果になる可能性があります。
*   `int8(i64)`: `int64` 型の値を `int8` 型に変換しようとしています。元の値 (`i64`) が変換先の型 (`int8`) の範囲を超えている場合、**オーバーフロー**が発生し、値がラップアラウンド（範囲の反対側に折り返す）したり、未定義の動作になったりする可能性があります。Goはコンパイル時にはこれをエラーにしませんが、実行時に問題を引き起こす可能性があるため、変換前に値の範囲を確認することが重要です（`math` パッケージの定数 `math.MinInt8`, `math.MaxInt8` などを使ってチェックできます）。

Goでは型変換を明示的に行う必要があるため、コードの意図が明確になり、型の不一致によるバグを減らすことができます。ただし、変換時にはデータの損失（精度低下やオーバーフロー）が発生する可能性に注意が必要です。