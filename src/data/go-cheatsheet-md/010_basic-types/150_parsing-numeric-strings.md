---
title: "基本の型: 数値文字列の解析 (Parse)"
tags: ["basic-types", "型変換", "文字列", "string", "数値", "strconv", "ParseFloat", "ParseInt", "ParseUint", "エラー処理"]
---

`strconv.Atoi` は10進数の文字列を `int` に変換する便利な関数ですが、より詳細な制御が必要な場合や、`int` 以外の数値型（浮動小数点数、特定のサイズの整数、異なる基数の数値など）に変換したい場合は、`strconv` パッケージの `Parse` 系の関数を使います。

これらの関数も `Atoi` と同様に、変換結果と `error` の二つの値を返します。**エラーチェックは必須**です。

## 浮動小数点数文字列の解析: `strconv.ParseFloat()`

文字列を `float32` または `float64` に変換します。

`func ParseFloat(s string, bitSize int) (float64, error)`

*   `s`: 解析したい文字列。
*   `bitSize`: 変換先の浮動小数点数のビットサイズを指定します (`32` または `64`)。
*   戻り値: 変換された `float64` の値と `error`。`bitSize` に `32` を指定した場合でも、戻り値の型は `float64` ですが、その値は `float32` で表現可能な範囲に収まります（必要であれば `float32()` で変換します）。

```go title="ParseFloat の使用例"
package main

import (
	"fmt"
	"strconv"
)

func main() {
	str1 := "3.14159"
	str2 := "-1.23e-4" // 指数表記
	str3 := "not a float"

	// float64 として解析
	f64, err1 := strconv.ParseFloat(str1, 64)
	if err1 != nil {
		fmt.Printf("エラー (str1): %v\n", err1)
	} else {
		fmt.Printf("文字列 \"%s\" -> float64: %f (%T)\n", str1, f64, f64)
	}

	f64exp, err2 := strconv.ParseFloat(str2, 64)
	if err2 != nil {
		fmt.Printf("エラー (str2): %v\n", err2)
	} else {
		fmt.Printf("文字列 \"%s\" -> float64: %f (%T)\n", str2, f64exp, f64exp)
	}

	// float32 として解析 (戻り値は float64 だが、float32 の範囲に収まる)
	f32val, err3 := strconv.ParseFloat(str1, 32)
	if err3 != nil {
		fmt.Printf("エラー (str1 as f32): %v\n", err3)
	} else {
		f32 := float32(f32val) // 必要なら float32 に変換
		fmt.Printf("文字列 \"%s\" -> float32: %f (%T)\n", str1, f32, f32)
	}

	// 失敗する例
	_, err4 := strconv.ParseFloat(str3, 64)
	if err4 != nil {
		fmt.Printf("エラー (str3): %v\n", err4)
	}
}

/* 実行結果:
文字列 "3.14159" -> float64: 3.141590 (float64)
文字列 "-1.23e-4" -> float64: -0.000123 (float64)
文字列 "3.14159" -> float32: 3.141590 (float32)
エラー (str3): strconv.ParseFloat: parsing "not a float": invalid syntax
*/
```

## 整数文字列の解析: `strconv.ParseInt()` と `strconv.ParseUint()`

文字列を符号付き整数 (`int64`) または符号なし整数 (`uint64`) に変換します。10進数だけでなく、2進数、8進数、16進数などの文字列も解析できます。

`func ParseInt(s string, base int, bitSize int) (int64, error)`
`func ParseUint(s string, base int, bitSize int) (uint64, error)`

*   `s`: 解析したい文字列。
*   `base`: 文字列が何進数で書かれているかを指定します (2〜36)。
    *   `0` を指定すると、プレフィックスから自動判別します (`0b` または `0B` で2進数、`0` で8進数、`0x` または `0X` で16進数、それ以外は10進数)。
    *   `10` を指定すると、常に10進数として扱います。
*   `bitSize`: 変換先の整数のビットサイズを指定します (`0`, `8`, `16`, `32`, `64`)。`0` は `int` または `uint` のサイズを意味します。このサイズは、結果の値が収まるべき範囲のチェックにも使われます。
*   戻り値: 変換された `int64` または `uint64` の値と `error`。`bitSize` に小さい値を指定した場合でも、戻り値の型は `int64` / `uint64` ですが、その値は指定したビットサイズで表現可能な範囲に収まります（必要であれば `int8()`, `uint16()` などで変換します）。

```go title="ParseInt と ParseUint の使用例"
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 10進数文字列
	i10, err1 := strconv.ParseInt("-123", 10, 64) // 10進数, 64ビット
	if err1 == nil {
		fmt.Printf("\"-123\" (10進) -> int64: %d\n", i10)
	}

	// 16進数文字列 (プレフィックス 0x)
	i16, err2 := strconv.ParseInt("0xFF", 0, 64) // base=0 で自動判別, 64ビット
	if err2 == nil {
		fmt.Printf("\"0xFF\" (16進) -> int64: %d\n", i16) // 255
	}

	// 2進数文字列 (プレフィックス 0b)
	i2, err3 := strconv.ParseInt("0b1011", 0, 8) // base=0 で自動判別, 8ビット
	if err3 == nil {
		i8 := int8(i2) // int8 に変換
		fmt.Printf("\"0b1011\" (2進) -> int8: %d\n", i8) // 11
	}

	// 符号なし整数 (10進数)
	u10, err4 := strconv.ParseUint("456", 10, 64) // 10進数, 64ビット
	if err4 == nil {
		fmt.Printf("\"456\" (10進) -> uint64: %d\n", u10)
	}

	// 失敗する例 (範囲外)
	_, err5 := strconv.ParseInt("300", 10, 8) // "300" は int8 (-128〜127) の範囲外
	if err5 != nil {
		fmt.Printf("エラー (\"300\" as int8): %v\n", err5) // "value out of range"
	}

	// 失敗する例 (不正な文字)
	_, err6 := strconv.ParseInt("12a3", 10, 64) // 10進数に 'a' は含まれない
	if err6 != nil {
		fmt.Printf("エラー (\"12a3\"): %v\n", err6) // "invalid syntax"
	}
}

/* 実行結果:
"-123" (10進) -> int64: -123
"0xFF" (16進) -> int64: 255
"0b1011" (2進) -> int8: 11
"456" (10進) -> uint64: 456
エラー ("300" as int8): strconv.ParseInt: parsing "300": value out of range
エラー ("12a3"): strconv.ParseInt: parsing "12a3": invalid syntax
*/
```

`strconv` パッケージの `Parse` 系関数を使うことで、様々な形式の数値文字列を柔軟に解析できますが、常にエラー処理を忘れずに行うことが重要です。