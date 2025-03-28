---
title: "データ構造: 配列 (Array) の宣言"
tags: ["data-structures", "配列", "array", "固定長", "ゼロ値"]
---

プログラムでは、複数の値をまとめて扱いたいことがよくあります。Go言語で最も基本的なデータ構造の一つが**配列 (Array)** です。

## 配列 (Array) とは？

配列は、**同じ型**の要素を**固定された数**だけ順番に格納するデータ構造です。一度宣言すると、その**サイズ（要素数）を変更することはできません**。

## 配列の宣言

Goで配列を宣言するには、`var` キーワードと以下の構文を使います。

**構文:** `var 変数名 [サイズ]要素の型`

*   `変数名`: 配列を識別するための名前。
*   `[サイズ]`: 配列に格納できる要素の数を**整数リテラル**で指定します。このサイズは**定数**である必要があります。
*   `要素の型`: 配列に格納する要素の型を指定します（例: `int`, `string`, `bool` など）。配列のすべての要素は同じ型でなければなりません。

配列を宣言した際に初期値を指定しない場合、配列の各要素は、その**要素の型のゼロ値**で自動的に初期化されます。

```go title="配列の宣言とゼロ値"
package main

import "fmt"

func main() {
	// --- 配列の宣言 ---
	// サイズが 5 の int 型配列を宣言
	// 各要素は int のゼロ値である 0 で初期化される
	var numbers [5]int

	// サイズが 3 の string 型配列を宣言
	// 各要素は string のゼロ値である "" (空文字列) で初期化される
	var names [3]string

	// サイズが 2 の bool 型配列を宣言
	// 各要素は bool のゼロ値である false で初期化される
	var flags [2]bool

	// --- ゼロ値の確認 ---
	fmt.Println("--- int 配列 (ゼロ値) ---")
	fmt.Printf("numbers: %v (型: %T, 長さ: %d)\n", numbers, numbers, len(numbers))
	// fmt.Println(numbers[0]) // 0
	// fmt.Println(numbers[4]) // 0

	fmt.Println("\n--- string 配列 (ゼロ値) ---")
	fmt.Printf("names: %q (型: %T, 長さ: %d)\n", names, names, len(names)) // %q でダブルクォート付き表示
	// fmt.Println(names[0]) // ""

	fmt.Println("\n--- bool 配列 (ゼロ値) ---")
	fmt.Printf("flags: %v (型: %T, 長さ: %d)\n", flags, flags, len(flags))
	// fmt.Println(flags[0]) // false

	// --- 配列のサイズは型の一部 ---
	// var anotherNumbers [10]int
	// numbers = anotherNumbers // コンパイルエラー: cannot use anotherNumbers (variable of type [10]int) as [5]int value in assignment
	// サイズが異なると、たとえ要素の型が同じでも、異なる型として扱われる
}

/* 実行結果:
--- int 配列 (ゼロ値) ---
numbers: [0 0 0 0 0] (型: [5]int, 長さ: 5)

--- string 配列 (ゼロ値) ---
names: ["" "" ""] (型: [3]string, 長さ: 3)

--- bool 配列 (ゼロ値) ---
flags: [false false] (型: [2]bool, 長さ: 2)
*/
```

**コード解説:**

*   `var numbers [5]int`: サイズが 5 で、要素の型が `int` の配列 `numbers` を宣言しています。`numbers` の型は `[5]int` です。
*   `var names [3]string`: サイズが 3 で、要素の型が `string` の配列 `names` を宣言しています。`names` の型は `[3]string` です。
*   `var flags [2]bool`: サイズが 2 で、要素の型が `bool` の配列 `flags` を宣言しています。`flags` の型は `[2]bool` です。
*   宣言時に初期値を指定していないため、各配列の要素はそれぞれの型のゼロ値（`int` なら `0`、`string` なら `""`、`bool` なら `false`）で埋められています。
*   `len(配列変数)` で配列の長さを取得できます。配列の場合、この長さは宣言時に指定したサイズと同じになります。
*   **重要な点:** Goでは、配列の**サイズは型の一部**です。つまり、`[5]int` と `[10]int` は異なる型として扱われ、互いに代入することはできません。

配列は固定長であるため、要素数が実行時に変わる可能性がある場合には不便なことがあります。そのような場合には、より柔軟な**スライス (Slice)** がよく使われます。スライスについては後のセクションで詳しく学びます。

次のセクションでは、配列を宣言と同時に初期化する方法を見ていきます。