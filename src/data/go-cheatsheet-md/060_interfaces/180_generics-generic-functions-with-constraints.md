## タイトル
title: 制約付きジェネリック関数

## タグ
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "関数"]

## コード
```go
package main

import "fmt"

// 型制約int または float64
type Number interface {
	int | float64
}

// ジェネリック関数: Number 制約を持つ型 T のスライスの合計を計算
func SumNumbers[T Number](values []T) T {
	var sum T // T のゼロ値で初期化
	for _, v := range values {
		sum += v // + 演算子が使えることが保証される
	}
	return sum
}

func main() {
	intSlice := []int{1, 2, 3}
	floatSlice := []float64{1.1, 2.2}

	// T が int と推論される
	intSum := SumNumbers(intSlice)
	fmt.Printf("Sum(%v) = %v (%T)\n", intSlice, intSum, intSum)

	// T が float64 と推論される
	floatSum := SumNumbers(floatSlice)
	fmt.Printf("Sum(%v) = %v (%T)\n", floatSlice, floatSum, floatSum)

	// SumNumbers([]string{"a"}) // エラー: string は Number 制約を満たさない
}

```

## 解説
```text
インターフェースを型制約として使い、特定の条件を満たす
様々な型に対して動作する**ジェネリック関数**を定義できます。

**定義構文:**
`func 関数名[型パラメータ名 型制約](引数リスト) 戻り値リスト { ... }`

*   `[型パラメータ名 型制約]`: 型パラメータ `T` と、
    それが満たすべき型制約インターフェース `Number` を指定。
*   引数、戻り値、関数本体内で型パラメータ `T` を使える。

コード例の `SumNumbers` 関数:
*   `[T Number]`: 型パラメータ `T` は `Number` 制約
    (`int | float64`) を満たす必要がある。
*   `values []T`: `T` 型のスライスを受け取る。
*   `T`: `T` 型の値を返す。
*   関数内では `T` が `int` か `float64` であることが
    保証されるため、`+` 演算子を安全に使える。

**型推論:**
`SumNumbers(intSlice)` のように呼び出すと、コンパイラは
引数 `intSlice` (`[]int`) から `T` が `int` であると
自動的に推論します。通常、型パラメータを明示的に
指定する必要はありません (`SumNumbers[int](...)`)。

**その他の制約例:**
*   `comparable`: 組み込みの制約で、`==` や `!=` で
    比較可能な型を指定します。
    `func AreEqual[T comparable](a, b T) bool { return a == b }`
*   `constraints.Ordered`: 大小比較可能な型を指定
    (整数、浮動小数点数、文字列)。

ジェネリック関数と型制約インターフェースにより、
型安全性を保ちつつ再利用可能なコードを書けます。