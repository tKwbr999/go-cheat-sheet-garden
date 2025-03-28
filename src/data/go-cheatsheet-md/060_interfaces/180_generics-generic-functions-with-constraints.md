---
title: "インターフェース: 制約付きジェネリック関数"
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "関数"]
---

インターフェースを型制約として使うことで、特定の条件を満たす様々な型に対して動作する**ジェネリック関数 (Generic Function)** を定義できます。

## ジェネリック関数の定義構文

**構文:** `func 関数名[型パラメータ名 型制約](引数リスト) 戻り値リスト { ... }`

*   `[型パラメータ名 型制約]`: 角括弧 `[]` の中に、**型パラメータ**とその**型制約**（インターフェース）を指定します。
    *   `型パラメータ名`: 関数内で具体的な型の代わりとして使われる名前（通常は大文字1文字、例: `T`, `K`, `V`）。
    *   `型制約`: 型パラメータが満たすべき条件を指定するインターフェース名（例: `Number`, `Stringer`, `comparable`）。
*   `引数リスト`, `戻り値リスト`, `{ ... }`: 通常の関数定義と同様ですが、引数や戻り値の型、関数本体内で型パラメータ名（例: `T`）を使うことができます。

## コード例: 数値スライスの合計を計算するジェネリック関数

前のセクションで定義した `Number` インターフェース（`int | float64` を制約）を使って、`int` または `float64` のスライスの合計を計算するジェネリック関数 `SumNumbers` を定義してみましょう。

```go title="制約付きジェネリック関数の定義と使用"
package main

import "fmt"

// --- 型制約インターフェース ---
// Number: int または float64 であることを制約
type Number interface {
	int | float64
	// Go 1.18 以降、組み込みの制約を利用することも可能
	// import "golang.org/x/exp/constraints"
	// type Number interface { constraints.Integer | constraints.Float }
}

// --- ジェネリック関数の定義 ---
// SumNumbers: Number 制約を満たす任意の型 T のスライスを受け取り、
// その合計を同じ型 T で返すジェネリック関数
func SumNumbers[T Number](values []T) T {
	var sum T // 型パラメータ T のゼロ値で初期化 (int なら 0, float64 なら 0.0)
	// ループ内で + 演算子を使えるのは、
	// T が Number 制約 (int | float64) によって + が使える型だと保証されているため
	for _, v := range values {
		sum += v
	}
	return sum
}

// --- 比較可能な型に対するジェネリック関数 (例) ---
// Index: スライスの中から指定した値が最初に見つかるインデックスを返す
// T は比較可能 (==) である必要があるため、comparable 制約を使う
func Index[T comparable](slice []T, value T) int {
	for i, v := range slice {
		// T が comparable なので == 演算子が使える
		if v == value {
			return i
		}
	}
	return -1 // 見つからなかった場合
}

func main() {
	// --- SumNumbers の呼び出し ---
	intSlice := []int{1, 2, 3, 4, 5}
	floatSlice := []float64{1.1, 2.2, 3.3}

	// int スライスを渡して呼び出し
	// コンパイラが引数から T が int であると推論する
	intSum := SumNumbers(intSlice)
	fmt.Printf("SumNumbers(%v) = %v (型: %T)\n", intSlice, intSum, intSum)

	// float64 スライスを渡して呼び出し
	// コンパイラが引数から T が float64 であると推論する
	floatSum := SumNumbers(floatSlice)
	fmt.Printf("SumNumbers(%v) = %v (型: %T)\n", floatSlice, floatSum, floatSum)

	// string スライスを渡そうとするとコンパイルエラー
	// stringSlice := []string{"a", "b"}
	// SumNumbers(stringSlice) // エラー: string does not implement Number (missing type int | float64)

	// --- Index の呼び出し ---
	strSlice := []string{"apple", "banana", "cherry"}
	fmt.Printf("\nIndex(%v, \"banana\") = %d\n", strSlice, Index(strSlice, "banana")) // 1
	fmt.Printf("Index(%v, \"grape\") = %d\n", strSlice, Index(strSlice, "grape"))   // -1

	numSlice := []int{10, 20, 30, 20}
	fmt.Printf("Index(%v, 20) = %d\n", numSlice, Index(numSlice, 20)) // 1 (最初に見つかったインデックス)
}

/* 実行結果:
SumNumbers([1 2 3 4 5]) = 15 (型: int)
SumNumbers([1.1 2.2 3.3]) = 6.6 (型: float64)

Index([apple banana cherry], "banana") = 1
Index([apple banana cherry], "grape") = -1
Index([10 20 30 20], 20) = 1
*/
```

**コード解説:**

*   `func SumNumbers[T Number](values []T) T`:
    *   `[T Number]`: 型パラメータ `T` が `Number` インターフェース（`int | float64`）を満たす必要があることを示します。
    *   `values []T`: 引数として `T` 型のスライスを受け取ります。
    *   `T`: 戻り値として `T` 型の値を返します。
    *   `var sum T`: `T` 型の変数 `sum` を宣言し、ゼロ値で初期化します。
    *   `sum += v`: `T` が `Number` 制約を満たすため、`+` 演算子が使えることが保証されています。
*   `func Index[T comparable](slice []T, value T) int`:
    *   `[T comparable]`: 型パラメータ `T` が組み込みの `comparable` 制約を満たす（`==` や `!=` で比較可能である）必要があることを示します。
    *   `if v == value`: `T` が `comparable` なので `==` 演算子が使えます。
*   **型推論:** `SumNumbers(intSlice)` や `SumNumbers(floatSlice)` のように関数を呼び出す際、Goコンパイラは通常、渡された引数の型（`[]int` や `[]float64`）から型パラメータ `T` が何であるか（`int` か `float64` か）を**自動的に推論**します。そのため、`SumNumbers[int](intSlice)` のように明示的に型を指定する必要はほとんどありません。

ジェネリック関数とインターフェースによる型制約を組み合わせることで、様々な型に対して安全かつ再利用可能なコードを記述することができます。