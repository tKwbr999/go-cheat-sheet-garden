---
title: "基本の型: 値の文字列へのフォーマット (Format)"
tags: ["basic-types", "型変換", "文字列", "string", "フォーマット", "strconv", "FormatBool", "FormatFloat", "FormatInt", "FormatUint", "fmt", "Sprintf"]
---

数値や真偽値などの値を、人間が読みやすい形や特定の形式の文字列に変換したい場合があります。例えば、計算結果をメッセージに埋め込んだり、数値を特定の桁数で表示したりする場合です。Go言語では、主に `strconv` パッケージの `Format` 系関数や、`fmt` パッケージの `Sprintf` 関数を使ってこれを行います。

## `strconv` パッケージによるフォーマット

`strconv` パッケージには、様々な型の値を文字列に変換するための `Format` 系関数が用意されています。

### 真偽値 (`bool`) -> 文字列: `strconv.FormatBool()`

`bool` 型の値 (`true` または `false`) を文字列 `"true"` または `"false"` に変換します。

`func FormatBool(b bool) string`

### 浮動小数点数 (`float`) -> 文字列: `strconv.FormatFloat()`

`float64` または `float32` の値を指定した書式で文字列に変換します。

`func FormatFloat(f float64, fmt byte, prec, bitSize int) string`

*   `f`: 変換したい浮動小数点数。
*   `fmt`: フォーマット指定子（`byte` 型）。
    *   `'f'`: 小数点形式 (`-ddd.dddd`)。
    *   `'e'`, `'E'`: 指数形式 (`-d.dddde±dd`, `-d.ddddE±dd`)。
    *   `'g'`, `'G'`: 指数 (`e`/`E`) または小数点 (`f`) のどちらか短い方。
    *   `'b'`: 2進数の指数形式。
    *   など。
*   `prec`: 精度指定。
    *   `fmt` が `'f'`, `'e'`, `'E'` の場合: 小数点以下の桁数。
    *   `fmt` が `'g'`, `'G'` の場合: 有効数字の最大桁数。
    *   `-1` を指定すると、必要最小限の桁数で表現します。
*   `bitSize`: 元の浮動小数点数のビットサイズ (`32` または `64`)。

### 整数 (`int`, `uint`) -> 文字列: `strconv.FormatInt()`, `strconv.FormatUint()`

符号付き整数 (`int64`) または符号なし整数 (`uint64`) を指定した基数（N進数）の文字列に変換します。

`func FormatInt(i int64, base int) string`
`func FormatUint(i uint64, base int) string`

*   `i`: 変換したい整数。
*   `base`: 変換後の文字列の基数を指定します (2〜36)。
    *   `2`: 2進数
    *   `8`: 8進数
    *   `10`: 10進数
    *   `16`: 16進数 (小文字 `a-f`)

**注意:** `FormatInt` や `FormatUint` に `int` や `uint` 型の値を渡す場合は、`int64()` や `uint64()` で明示的に型変換する必要があります。

```go title="strconv.Format 系関数の使用例"
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// Bool -> String
	b := true
	sBool := strconv.FormatBool(b)
	fmt.Printf("%t (%T) -> \"%s\" (%T)\n", b, b, sBool, sBool)

	// Float -> String
	f := 3.14159265
	// 小数点以下2桁 ('f'形式)
	sF1 := strconv.FormatFloat(f, 'f', 2, 64)
	fmt.Printf("%f -> \"%s\" ('f', prec=2)\n", f, sF1)
	// 指数形式 ('e'形式, 精度3桁)
	sF2 := strconv.FormatFloat(f, 'e', 3, 64)
	fmt.Printf("%f -> \"%s\" ('e', prec=3)\n", f, sF2)
	// 必要最小限の桁数 ('g'形式)
	sF3 := strconv.FormatFloat(f, 'g', -1, 64)
	fmt.Printf("%f -> \"%s\" ('g', prec=-1)\n", f, sF3)

	// Int -> String
	i := -123
	// 10進数
	sI10 := strconv.FormatInt(int64(i), 10) // int を int64 に変換
	fmt.Printf("%d (%T) -> \"%s\" (10進)\n", i, i, sI10, sI10)
	// 16進数
	sI16 := strconv.FormatInt(int64(i), 16)
	fmt.Printf("%d (%T) -> \"%s\" (16進)\n", i, i, sI16, sI16) // 負数は2の補数表現になる場合がある
	// 2進数
	sI2 := strconv.FormatInt(int64(i), 2)
	fmt.Printf("%d (%T) -> \"%s\" (2進)\n", i, i, sI2, sI2)

	// Uint -> String
	u := uint(255)
	// 10進数
	sU10 := strconv.FormatUint(uint64(u), 10) // uint を uint64 に変換
	fmt.Printf("%d (%T) -> \"%s\" (10進)\n", u, u, sU10, sU10)
	// 16進数
	sU16 := strconv.FormatUint(uint64(u), 16)
	fmt.Printf("%d (%T) -> \"%s\" (16進)\n", u, u, sU16, sU16)
	// 8進数
	sU8 := strconv.FormatUint(uint64(u), 8)
	fmt.Printf("%d (%T) -> \"%s\" (8進)\n", u, u, sU8, sU8)

	// strconv.Itoa は FormatInt(i, 10) の短縮形
	sItoa := strconv.Itoa(i)
	fmt.Printf("Itoa(%d) -> \"%s\"\n", i, sItoa)
}

/* 実行結果:
true (bool) -> "true" (string)
3.141593 -> "3.14" ('f', prec=2)
3.141593 -> "3.142e+00" ('e', prec=3)
3.141593 -> "3.14159265" ('g', prec=-1)
-123 (int) -> "-123" (10進)
-123 (int) -> "-7b" (16進)
-123 (int) -> "-1111011" (2進)
255 (uint) -> "255" (10進)
255 (uint) -> "ff" (16進)
255 (uint) -> "377" (8進)
Itoa(-123) -> "-123"
*/
```

## `fmt.Sprintf()` によるフォーマット

`fmt` パッケージの `Sprintf` 関数を使うと、`Printf` と同じような書式指定文字列（フォーマット動詞）を使って、値を整形した文字列を直接生成できます。複数の値を一度に埋め込んだり、より複雑なフォーマットを行ったりする場合に便利です。

`func Sprintf(format string, a ...any) string`

*   `format`: 書式指定文字列（`%d`, `%f`, `%s`, `%v` などを含む）。
*   `a ...any`: フォーマット文字列に埋め込む値（可変長引数）。
*   戻り値: フォーマットされた文字列。

```go title="fmt.Sprintf の使用例"
package main

import "fmt"

func main() {
	name := "Gopher"
	age := 13
	pi := 3.14159

	// 複数の値を埋め込んだ文字列を生成
	message := fmt.Sprintf("名前: %s, 年齢: %d歳", name, age)
	fmt.Println(message)

	// 浮動小数点数の桁数を指定してフォーマット
	piStr := fmt.Sprintf("円周率: %.2f", pi) // 小数点以下2桁
	fmt.Println(piStr)

	// 整数をゼロ埋めや幅指定してフォーマット
	numStr := fmt.Sprintf("商品番号: %06d", 123) // 6桁、ゼロ埋め
	fmt.Println(numStr)

	// 値の型も表示 (%T)
	typeStr := fmt.Sprintf("変数 age の型は %T です", age)
	fmt.Println(typeStr)

	// 構造体などをそのまま表示 (%v, %+v, %#v)
	type Point struct { X, Y int }
	p := Point{10, 20}
	structStr1 := fmt.Sprintf("Point: %v", p)  // {10 20}
	structStr2 := fmt.Sprintf("Point: %+v", p) // {X:10 Y:20}
	structStr3 := fmt.Sprintf("Point: %#v", p) // main.Point{X:10, Y:20}
	fmt.Println(structStr1)
	fmt.Println(structStr2)
	fmt.Println(structStr3)
}

/* 実行結果:
名前: Gopher, 年齢: 13歳
円周率: 3.14
商品番号: 000123
変数 age の型は int です
Point: {10 20}
Point: {X:10 Y:20}
Point: main.Point{X:10, Y:20}
*/
```

**`strconv` vs `fmt.Sprintf`:**

*   **`strconv`:** 特定の型から文字列への基本的な変換、または特定の基数や精度での変換に適しています。パフォーマンスが `fmt.Sprintf` より若干良い場合があります。
*   **`fmt.Sprintf`:** 複数の値を組み合わせたり、複雑な書式（幅指定、ゼロ埋め、アラインメントなど）で文字列を生成する場合に非常に強力で便利です。

多くの場合、`fmt.Sprintf` の方が柔軟性が高く使いやすいですが、単純な型変換であれば `strconv` の関数も選択肢となります。