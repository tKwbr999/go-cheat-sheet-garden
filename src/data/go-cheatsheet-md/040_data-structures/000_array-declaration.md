## タイトル
title: データ構造: 配列 (Array) の宣言

## タグ
tags: ["data-structures", "配列", "array", "固定長", "ゼロ値"]

## コード
```go
package main

import "fmt"

func main() {
	// サイズ 5 の int 配列 (ゼロ値 0 で初期化)
	var numbers [5]int

	// サイズ 3 の string 配列 (ゼロ値 "" で初期化)
	var names [3]string

	// サイズ 2 の bool 配列 (ゼロ値 false で初期化)
	var flags [2]bool

	fmt.Printf("numbers: %v (%T, len=%d)\n", numbers, numbers, len(numbers))
	fmt.Printf("names:   %q (%T, len=%d)\n", names, names, len(names))
	fmt.Printf("flags:   %v (%T, len=%d)\n", flags, flags, len(flags))

	// var a [5]int
	// var b [10]int
	// a = b // コンパイルエラー: 型が違う ([5]int と [10]int)
}

```

## 解説
```text
**配列 (Array)** は、**同じ型**の要素を
**固定された数**だけ順番に格納するデータ構造です。
一度宣言すると**サイズ（要素数）は変更できません**。

**宣言構文:** `var 変数名 [サイズ]要素の型`
*   `[サイズ]`: 要素数を整数リテラルで指定 (定数)。
*   `要素の型`: 格納する要素の型 (`int`, `string` 等)。

初期値を指定せずに宣言した場合、各要素は
その**要素の型のゼロ値**で自動的に初期化されます。
*   数値型: `0`
*   `bool`: `false`
*   `string`: `""` (空文字列)

コード例では `numbers`, `names`, `flags` を宣言し、
それぞれのゼロ値で初期化されていることを確認しています。

`len(配列変数)` で配列の長さ（サイズ）を取得できます。

**重要:** Goでは配列の**サイズは型の一部**です。
`[5]int` と `[10]int` は異なる型として扱われ、
互いに代入することはできません。

配列は固定長のため、要素数が可変の場合は
**スライス (Slice)** がよく使われます (別記)。