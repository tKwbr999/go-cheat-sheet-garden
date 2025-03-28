---
title: "データ構造: 配列 (Array) のサイズ推論 `...`"
tags: ["data-structures", "配列", "array", "初期化", "リテラル", "サイズ推論", "..."]
---

配列をリテラルで初期化する際、要素の数を正確に数えてサイズを指定するのは、要素数が多い場合に面倒だったり、間違いやすかったりします。Go言語では、配列のサイズ指定部分に `...` を使うことで、コンパイラに**初期値の数から配列のサイズを自動的に推論**させることができます。

## サイズ推論 `[...]` の使い方

**構文:** `変数名 := [...]要素の型{値1, 値2, ...}`

*   `[...]`: サイズを指定する代わりに `...` を書きます。
*   `{値1, 値2, ...}`: 中括弧の中に初期値を記述します。
*   コンパイラは、中括弧の中に指定された**初期値の個数**を数え、それを配列のサイズとして決定します。

```go title="[...] を使ったサイズ推論"
package main

import "fmt"

func main() {
	// 初期値が 4 つなので、サイズ 4 の配列になる ([4]int)
	numbers := [...]int{10, 20, 30, 40}
	fmt.Printf("numbers: %v (型: %T, 長さ: %d)\n", numbers, numbers, len(numbers))

	// 初期値が 3 つなので、サイズ 3 の配列になる ([3]string)
	weekdays := [...]string{"Monday", "Tuesday", "Wednesday"}
	fmt.Printf("weekdays: %q (型: %T, 長さ: %d)\n", weekdays, weekdays, len(weekdays))

	// 要素が一つでも配列になる
	single := [...]bool{true}
	fmt.Printf("single: %v (型: %T, 長さ: %d)\n", single, single, len(single)) // 型は [1]bool

	// 要素がなくてもサイズ 0 の配列になる
	empty := [...]float64{}
	fmt.Printf("empty: %v (型: %T, 長さ: %d)\n", empty, empty, len(empty)) // 型は [0]float64
}

/* 実行結果:
numbers: [10 20 30 40] (型: [4]int, 長さ: 4)
weekdays: ["Monday" "Tuesday" "Wednesday"] (型: [3]string, 長さ: 3)
single: [true] (型: [1]bool, 長さ: 1)
empty: [] (型: [0]float64, 長さ: 0)
*/
```

## 利点

*   **要素数を数える手間が省ける:** 特に要素数が多い場合に便利です。
*   **要素の追加・削除に強い:** 配列リテラル内の要素を追加したり削除したりした際に、サイズ指定 `[N]` を手動で修正する必要がありません。コンパイラが自動的に正しいサイズを計算してくれます。

## インデックス指定初期化との組み合わせ

`[...]` は、特定のインデックスを指定して初期化する方法とも組み合わせることができます。この場合、配列のサイズは**指定された最大のインデックス + 1** になります。

```go title="[...] とインデックス指定の組み合わせ"
package main

import "fmt"

func main() {
	// 最大インデックスが 4 なので、サイズは 4 + 1 = 5 になる ([5]int)
	// インデックス 2, 3 はゼロ値 (0) で初期化される
	indexed := [...]int{0: 10, 1: 20, 4: 50}
	fmt.Printf("indexed: %v (型: %T, 長さ: %d)\n", indexed, indexed, len(indexed))

	// 最大インデックスが 99 なので、サイズは 99 + 1 = 100 になる ([100]string)
	largeIndex := [...]string{99: "Last"}
	fmt.Printf("largeIndex[99]: %q (型: %T, 長さ: %d)\n", largeIndex[99], largeIndex, len(largeIndex))
}

/* 実行結果:
indexed: [10 20 0 0 50] (型: [5]int, 長さ: 5)
largeIndex[99]: "Last" (型: [100]string, 長さ: 100)
*/
```

`[...]` を使うことで、配列の初期化をより柔軟かつ安全に行うことができます。ただし、生成されるのは依然として**固定長の配列**であることに注意してください。要素数が可変のデータ構造が必要な場合は、スライスを使います。