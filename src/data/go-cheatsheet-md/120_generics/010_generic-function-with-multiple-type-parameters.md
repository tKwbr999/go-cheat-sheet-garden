## タイトル
title: 複数の型パラメータを持つジェネリック関数

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "関数", "any", "マップ関数"]

## コード
```go
package main

import "fmt"

// ジェネリック関数 Map: スライス s ([]T) の各要素に f (func(T) U) を適用し、
// 結果のスライス ([]U) を返す。
// [T, U any] で2つの型パラメータ T と U (どちらも任意の型) を定義。
func Map[T, U any](s []T, f func(T) U) []U {
	result := make([]U, len(s))
	for i, v := range s {
		result[i] = f(v)
	}
	return result
}

func main() {
	intSlice := []int{1, 2, 3}
	fmt.Printf("Input: %v\n", intSlice)

	// 例1: int -> int (2乗)
	// T=int, U=int と推論される
	squares := Map(intSlice, func(x int) int { return x * x })
	fmt.Printf("Squares: %v (%T)\n", squares, squares)

	// 例2: int -> string (フォーマット)
	// T=int, U=string と推論される
	idStrings := Map(intSlice, func(x int) string { return fmt.Sprintf("ID-%d", x) })
	fmt.Printf("Strings: %v (%T)\n", idStrings, idStrings)

	// 例3: string -> int (文字数) も可能 (省略)
	// stringSlice := []string{"a", "bb"}
	// lengths := Map(stringSlice, func(s string) int { return len(s) })
}

```

## 解説
```text
ジェネリック関数は**複数の型パラメータ**を持つこともできます。
型パラメータリスト `[...]` 内にカンマ区切りで記述します。

**構文:**
`func Fn[P1 C1, P2 C2](...) (...) { ... }`
*   `P1`, `P2`: 型パラメータ名 (例: `T`, `U`)。
*   `C1`, `C2`: 対応する型制約 (例: `any`)。

定義した複数の型パラメータは、引数や戻り値で自由に組み合わせられます。

コード例の `Map` 関数は、スライスの要素変換を行う典型的な例です。
`func Map[T, U any](s []T, f func(T) U) []U`
*   `T`: 入力スライスの要素型。
*   `U`: 出力スライスの要素型。
*   `s`: 入力スライス (`[]T`)。
*   `f`: `T` を受け取り `U` を返す変換関数 (`func(T) U`)。
*   戻り値: 変換後のスライス (`[]U`)。

`main` 関数での呼び出し例:
*   `Map(intSlice, func(x int) int { ... })`:
    引数から `T=int`, `U=int` と推論される。
*   `Map(intSlice, func(x int) string { ... })`:
    引数から `T=int`, `U=string` と推論される。
*   (同様に `string` スライスから `int` スライスへの変換も可能)

複数の型パラメータにより、異なる型間の汎用的な変換処理などを
型安全に記述できます。