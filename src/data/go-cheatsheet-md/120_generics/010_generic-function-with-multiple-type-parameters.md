---
title: "ジェネリクス: 複数の型パラメータを持つジェネリック関数"
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "関数", "any", "マップ関数"]
---

ジェネリック関数は、**複数の型パラメータ**を持つこともできます。これにより、異なる型の間での変換や関係性を表現する、より複雑で汎用的な関数を定義できます。

## 複数の型パラメータの定義

型パラメータリスト `[...]` の中に、カンマ (`,`) 区切りで複数の型パラメータとその制約を記述します。

**構文:** `func 関数名[P1 C1, P2 C2, ..., Pn Cn](引数リスト) (戻り値リスト) { ... }`

*   `P1`, `P2`, ..., `Pn`: 型パラメータ名（例: `T`, `U`, `K`, `V`）。
*   `C1`, `C2`, ..., `Cn`: 各型パラメータに対応する型制約（例: `any`, `comparable`, インターフェース型）。

定義された複数の型パラメータは、関数の引数や戻り値の型として自由に組み合わせることができます。

## コード例: スライスの要素を変換する `Map` 関数

よくある例として、ある型のスライスの各要素に関数を適用し、別の型（または同じ型）のスライスの要素に変換する**マップ (Map)** 関数を実装してみましょう。この関数は、入力スライスの要素の型 `T` と、出力スライスの要素の型 `U` という2つの型パラメータを必要とします。

```go title="複数の型パラメータを持つ Map 関数"
package main

import "fmt"

// --- ジェネリック関数 Map の定義 ---
// T: 入力スライスの要素の型
// U: 出力スライスの要素の型
// 制約はどちらも any (任意の型)
// 引数:
//   s: T 型の要素を持つ入力スライス ([]T)
//   f: T 型の引数を取り U 型の値を返す関数 (func(T) U)
// 戻り値:
//   U 型の要素を持つ出力スライス ([]U)
func Map[T, U any](s []T, f func(T) U) []U {
	// 結果を格納するための U 型のスライスを作成 (長さは入力と同じ)
	result := make([]U, len(s))
	// 入力スライス s の各要素 v とそのインデックス i についてループ
	for i, v := range s {
		// 関数 f に要素 v を適用し、その結果 (U 型) を result スライスに格納
		result[i] = f(v)
	}
	// 結果のスライスを返す
	return result
}

func main() {
	// --- Map 関数の使用例 ---
	intSlice := []int{1, 2, 3, 4}
	fmt.Printf("元の int スライス: %v\n", intSlice)

	// 例1: int スライスを int スライスに変換 (各要素を2乗)
	// T = int, U = int
	// f = func(x int) int { return x * x }
	// コンパイラは引数から T と U を推論する
	squares := Map(intSlice, func(x int) int { return x * x })
	fmt.Printf("2乗した結果 (int): %v (型: %T)\n", squares, squares)

	// 例2: int スライスを string スライスに変換 (各要素をフォーマット)
	// T = int, U = string
	// f = func(x int) string { return fmt.Sprintf("ID-%d", x) }
	idStrings := Map(intSlice, func(x int) string { return fmt.Sprintf("ID-%d", x) })
	fmt.Printf("文字列に変換した結果 (string): %v (型: %T)\n", idStrings, idStrings)

	// 例3: string スライスを int スライスに変換 (各要素の文字数)
	// T = string, U = int
	stringSlice := []string{"Go", "Generics", "Example"}
	fmt.Printf("\n元の string スライス: %v\n", stringSlice)
	lengths := Map(stringSlice, func(s string) int { return len(s) })
	fmt.Printf("文字数を取得した結果 (int): %v (型: %T)\n", lengths, lengths)
}

/* 実行結果:
元の int スライス: [1 2 3 4]
2乗した結果 (int): [1 4 9 16] (型: []int)
文字列に変換した結果 (string): [ID-1 ID-2 ID-3 ID-4] (型: []string)

元の string スライス: [Go Generics Example]
文字数を取得した結果 (int): [2 8 7] (型: []int)
*/
```

**コード解説:**

*   `func Map[T, U any](s []T, f func(T) U) []U`:
    *   `[T, U any]` で、`T` と `U` という2つの型パラメータを定義し、どちらも任意の型 (`any`) を受け入れることを指定しています。
    *   引数 `s` は `T` 型のスライス (`[]T`) です。
    *   引数 `f` は `T` 型の値を受け取り `U` 型の値を返す関数 (`func(T) U`) です。
    *   戻り値は `U` 型のスライス (`[]U`) です。
*   関数内では、`make([]U, len(s))` で結果用のスライスを作成し、`for range` で入力スライス `s` をループします。各要素 `v` (型 `T`) に対して関数 `f` を適用し、その結果 (型 `U`) を `result` スライスに格納しています。
*   **呼び出し:**
    *   `Map(intSlice, func(x int) int { ... })`: 引数からコンパイラは `T=int`, `U=int` と推論します。
    *   `Map(intSlice, func(x int) string { ... })`: 引数から `T=int`, `U=string` と推論します。
    *   `Map(stringSlice, func(s string) int { ... })`: 引数から `T=string`, `U=int` と推論します。

このように、複数の型パラメータを使うことで、異なる型の間での汎用的な変換処理などを型安全に記述することができます。