## タイトル
title: 値の文字列へのフォーマット (Format)

## タグ
tags: ["basic-types", "型変換", "文字列", "string", "フォーマット", "strconv", "FormatBool", "FormatFloat", "FormatInt", "FormatUint", "fmt", "Sprintf"]

## コード
```go
package main

import "fmt"

func main() {
	name := "Gopher"
	age := 13
	pi := 3.14159

	message := fmt.Sprintf("名前: %s, 年齢: %d歳", name, age)
	fmt.Println(message)

	piStr := fmt.Sprintf("円周率: %.2f", pi)
	fmt.Println(piStr)

	numStr := fmt.Sprintf("商品番号: %06d", 123)
	fmt.Println(numStr)

	typeStr := fmt.Sprintf("変数 age の型は %T です", age)
	fmt.Println(typeStr)

	type Point struct{ X, Y int }
	p := Point{10, 20}
	structStr1 := fmt.Sprintf("Point: %v", p)
	structStr2 := fmt.Sprintf("Point: %+v", p)
	structStr3 := fmt.Sprintf("Point: %#v", p)
	fmt.Println(structStr1)
	fmt.Println(structStr2)
	fmt.Println(structStr3)
}
```

## 解説
```text
数値や真偽値などを、特定の形式の文字列に
変換したい場合があります。Goでは主に
`strconv` パッケージの `Format` 系関数や
`fmt` パッケージの `Sprintf` 関数を使います。

**`strconv` パッケージの `Format` 系:**
特定の型から文字列への基本的な変換や、
特定の基数・精度での変換に適しています。
*   `FormatBool(b bool) string`: bool を "true"/"false" に。
*   `FormatFloat(f float64, fmt byte, prec, bitSize int) string`:
    float を指定書式 (`fmt`)、精度 (`prec`) で文字列に。
*   `FormatInt(i int64, base int) string`:
    int64 を指定基数 (`base`) の文字列に。
*   `FormatUint(i uint64, base int) string`:
    uint64 を指定基数 (`base`) の文字列に。
(注意: `int`/`uint` を渡す際は `int64()`/`uint64()` で変換が必要)

**`fmt.Sprintf()` 関数:**
`Printf` と同じ書式指定文字列 (`%d`, `%f`, `%s`, `%v` 等) を
使って、値を整形した文字列を直接生成します。
`func Sprintf(format string, a ...any) string`

*   `format`: 書式指定文字列。
*   `a ...any`: 埋め込む値 (可変長引数)。
*   戻り値: フォーマットされた文字列。

コード例のように、複数の値を埋め込んだり、
浮動小数点数の桁数指定 (`%.2f`)、
整数のゼロ埋め (`%06d`)、型の表示 (`%T`)、
構造体の表示 (`%v`, `%+v`, `%#v`) など、
柔軟なフォーマットが可能です。

**`strconv` vs `fmt.Sprintf`:**
*   `strconv`: 単純な型変換、基数/精度指定。パフォーマンスが良い場合あり。
*   `fmt.Sprintf`: 複数値の組み合わせ、複雑な書式指定。柔軟性が高い。

多くの場合 `fmt.Sprintf` が便利ですが、
単純な変換なら `strconv` も選択肢です。