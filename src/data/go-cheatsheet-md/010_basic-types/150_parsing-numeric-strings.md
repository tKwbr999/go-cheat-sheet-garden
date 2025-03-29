## タイトル
title: 数値文字列の解析 (Parse)

## タグ
tags: ["basic-types", "型変換", "文字列", "string", "数値", "strconv", "ParseFloat", "ParseInt", "ParseUint", "エラー処理"]

## コード
```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 10進数
	i10, err1 := strconv.ParseInt("-123", 10, 64)
	if err1 == nil {
		fmt.Printf("\"-123\" (10進) -> %d\n", i10)
	}

	// 16進数 (base=0 で自動判別)
	i16, err2 := strconv.ParseInt("0xFF", 0, 64)
	if err2 == nil {
		fmt.Printf("\"0xFF\" (16進) -> %d\n", i16) // 255
	}

	// 2進数 (base=0, bitSize=8)
	i2, err3 := strconv.ParseInt("0b1011", 0, 8)
	if err3 == nil {
		fmt.Printf("\"0b1011\" (2進) -> %d (int8: %d)\n", i2, int8(i2)) // 11
	}

	// 符号なし整数
	u10, err4 := strconv.ParseUint("456", 10, 64)
	if err4 == nil {
		fmt.Printf("\"456\" (10進) -> %d\n", u10)
	}

	// エラー例: 範囲外
	_, err5 := strconv.ParseInt("300", 10, 8) // int8 は -128~127
	if err5 != nil {
		fmt.Printf("エラー (\"300\" as int8): %v\n", err5)
	}

	// エラー例: 不正な文字
	_, err6 := strconv.ParseInt("12a3", 10, 64)
	if err6 != nil {
		fmt.Printf("エラー (\"12a3\"): %v\n", err6)
	}
}
```

## 解説
```text
`strconv.Atoi` は10進文字列を `int` に変換しますが、
より詳細な制御や他の型への変換には `Parse` 系関数を使います。
これらも変換結果と `error` を返し、**エラーチェック必須**です。

**浮動小数点数: `strconv.ParseFloat(s string, bitSize int)`**
文字列 `s` を `float64` に変換します。
`bitSize` に `32` または `64` を指定します。
戻り値は常に `float64` ですが、`bitSize=32` の場合、
値は `float32` の範囲に収まります。

**整数: `strconv.ParseInt`/`ParseUint`**
`ParseInt(s string, base int, bitSize int) (int64, error)`
`ParseUint(s string, base int, bitSize int) (uint64, error)`

*   `s`: 解析する文字列。
*   `base`: 基数 (2〜36)。`0` でプレフィックス
    (`0b`, `0`, `0x`) から自動判別。`10` で10進数固定。
*   `bitSize`: 結果のビットサイズ (`0`, `8`, `16`, `32`, `64`)。
    `0` は `int`/`uint` サイズ。範囲チェックにも使われます。
*   戻り値: `int64` または `uint64` と `error`。
    `bitSize` が小さくても戻り値型は `int64`/`uint64` ですが、
    値は指定ビットサイズの範囲に収まります。
    必要なら `int8(val)` などで変換します。

コード例のように、異なる基数の文字列を解析したり、
指定したビットサイズに値が収まるかチェックしたりできます。
範囲外 (`value out of range`) や不正な文字
(`invalid syntax`) でエラーになります。

常にエラー処理を忘れずに行いましょう。