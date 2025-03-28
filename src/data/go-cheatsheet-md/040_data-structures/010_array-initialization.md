---
title: "データ構造: 配列 (Array) の初期化"
tags: ["data-structures", "配列", "array", "初期化", "リテラル"]
---

配列を宣言する際に、ゼロ値ではなく、最初から特定の値で要素を埋めたい場合があります。Go言語では、**配列リテラル**を使って配列の宣言と初期化を同時に行うことができます。

## 配列リテラルによる初期化

**構文:** `変数名 := [サイズ]要素の型{値1, 値2, ..., 値N}`

*   `[サイズ]要素の型`: 宣言する配列の型（サイズと要素の型）。
*   `{値1, 値2, ..., 値N}`: 中括弧 `{}` の中に、配列の各要素の初期値をカンマ `,` で区切って記述します。
*   値の数は、宣言した配列の**サイズと一致**させる必要があります。
*   `:=` を使って宣言と初期化を同時に行うのが一般的です。`var` を使うこともできます (`var a = [3]int{1, 2, 3}`)。

```go title="配列リテラルによる初期化"
package main

import "fmt"

func main() {
	// サイズ 3 の int 配列を初期化
	numbers := [3]int{10, 20, 30}
	fmt.Printf("numbers: %v (型: %T, 長さ: %d)\n", numbers, numbers, len(numbers))

	// サイズ 4 の string 配列を初期化
	fruits := [4]string{"Apple", "Banana", "Cherry", "Date"}
	fmt.Printf("fruits: %q (型: %T, 長さ: %d)\n", fruits, fruits, len(fruits))

	// 要素数がサイズと一致しないとコンパイルエラー
	// error1 := [3]int{1, 2} // エラー: array literal has missing values
	// error2 := [3]int{1, 2, 3, 4} // エラー: index 3 is out of bounds (>= 3)
}

/* 実行結果:
numbers: [10 20 30] (型: [3]int, 長さ: 3)
fruits: ["Apple" "Banana" "Cherry" "Date"] (型: [4]string, 長さ: 4)
*/
```

## 要素数を省略した初期化 (`...`)

配列リテラルで初期値を指定する場合、配列のサイズ `[...]` の部分に `...` を書くと、コンパイラが**初期値の数に基づいて配列のサイズを自動的に決定**してくれます。これは、要素数を数える手間が省けるため便利です。

```go title="サイズ [...] による初期化"
package main

import "fmt"

func main() {
	// [...] を使うと、初期値の数 (5つ) からサイズが 5 と決定される
	primes := [...]int{2, 3, 5, 7, 11}
	fmt.Printf("primes: %v (型: %T, 長さ: %d)\n", primes, primes, len(primes)) // 型は [5]int

	// 文字列配列でも同様
	colors := [...]string{"Red", "Green", "Blue"}
	fmt.Printf("colors: %q (型: %T, 長さ: %d)\n", colors, colors, len(colors)) // 型は [3]string
}

/* 実行結果:
primes: [2 3 5 7 11] (型: [5]int, 長さ: 5)
colors: ["Red" "Green" "Blue"] (型: [3]string, 長さ: 3)
*/
```

## 特定のインデックスを指定した初期化

配列リテラルの中で `インデックス: 値` の形式を使うと、特定のインデックスの要素だけを初期化できます。指定されなかったインデックスの要素は、その型のゼロ値で初期化されます。

```go title="インデックス指定による初期化"
package main

import "fmt"

func main() {
	// サイズ 5 の配列で、インデックス 1 と 3 だけを初期化
	// 他の要素 (インデックス 0, 2, 4) はゼロ値 (0) になる
	sparseArray := [5]int{1: 10, 3: 30}
	fmt.Printf("sparseArray: %v (型: %T, 長さ: %d)\n", sparseArray, sparseArray, len(sparseArray))

	// [...] と組み合わせることも可能
	// この場合、最大のインデックス + 1 が配列のサイズになる (この例では 4+1 = 5)
	indexedPrimes := [...]int{1: 3, 2: 5, 4: 11, 0: 2} // 順不同でもOK
	fmt.Printf("indexedPrimes: %v (型: %T, 長さ: %d)\n", indexedPrimes, indexedPrimes, len(indexedPrimes))
}

/* 実行結果:
sparseArray: [0 10 0 30 0] (型: [5]int, 長さ: 5)
indexedPrimes: [2 3 5 0 11] (型: [5]int, 長さ: 5)
*/
```

**ポイント:**

*   `1: 10` は「インデックス 1 の要素を 10 で初期化する」という意味です。
*   インデックスは順不同で指定できます。
*   `[...]` とインデックス指定を組み合わせた場合、指定された最大のインデックスに基づいて配列のサイズが決まります。

配列リテラルを使うことで、配列を宣言すると同時に目的の値で初期化でき、コードをより簡潔に記述できます。