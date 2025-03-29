## タイトル
title: "ジェネリックな Min/Max 関数"

## タグ
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "cmp", "Ordered", "Min", "Max"]

## コード
```go
package main

import (
	"cmp" // Go 1.21+ で Ordered を使うためにインポート
	"fmt"
)

// Min は 2 つの順序付け可能な値のうち小さい方を返す
func Min[T cmp.Ordered](a, b T) T {
	// cmp.Ordered 制約により < 演算子が使える
	if a < b {
		return a
	}
	return b
}

// Max は 2 つの順序付け可能な値のうち大きい方を返す (030 で説明済み)
func Max[T cmp.Ordered](a, b T) T {
	// cmp.Ordered 制約により > 演算子が使える
	if a > b {
		return a
	}
	return b
}

func main() {
	// int で使用
	fmt.Printf("Min(10, 5) = %v\n", Min(10, 5)) // 5
	fmt.Printf("Max(10, 5) = %v\n", Max(10, 5)) // 10

	// float64 で使用
	fmt.Printf("Min(3.14, 2.71) = %v\n", Min(3.14, 2.71)) // 2.71
	fmt.Printf("Max(3.14, 2.71) = %v\n", Max(3.14, 2.71)) // 3.14

	// string で使用
	fmt.Printf("Min(\"apple\", \"banana\") = %v\n", Min("apple", "banana")) // "apple"
	fmt.Printf("Max(\"apple\", \"banana\") = %v\n", Max("apple", "banana")) // "banana"

	// Go 1.21 以降では、標準ライブラリに min, max 関数が追加された
	// import "cmp" // または import "math" (Go 1.23+)
	// fmt.Println(min(10, 5)) // 5
	// fmt.Println(max(3.14, 2.71)) // 3.14
}

/* 実行結果:
Min(10, 5) = 5
Max(10, 5) = 10
Min(3.14, 2.71) = 2.71
Max(3.14, 2.71) = 3.14
Min("apple", "banana") = apple
Max("apple", "banana") = banana
*/
```

## 解説
```text
ジェネリクスと型制約を使うことで、様々な型に対して動作する汎用的なユーティリティ関数を簡単に作成できます。その典型的な例が、任意の順序付け可能な型の最小値や最大値を求める関数です。

Go 1.21 以降で標準ライブラリの `cmp` パッケージで提供される **`cmp.Ordered`** 制約を使うことで、`<` や `>` 演算子を使える型（整数、浮動小数点数、文字列）に限定したジェネリック関数を定義できます。

`cmp.Ordered` 制約については、**「定義済みの型制約 (`comparable`, `cmp.Ordered`)」** (`120_generics/030_predefined-constraints-constraintsordered.md`) で既に説明しました。

ここでは、`cmp.Ordered` を使った `Min` 関数と `Max` 関数の実装例を再掲します。

**コード解説:**

*   `Min` 関数と `Max` 関数は、どちらも型パラメータ `T` に `cmp.Ordered` 制約を指定しています。
*   これにより、関数内で `<` や `>` 演算子を安全に使用できます。
*   これらの関数は、`int`, `float64`, `string` など、`cmp.Ordered` が許可する任意の型に対して動作します。

**補足:** Go 1.21 からは、標準ライブラリに組み込みの `min` 関数と `max` 関数が追加されました。これらはジェネリクスを使って実装されており、`cmp.Ordered` を満たす任意の型に対して動作します。そのため、自分で `Min` や `Max` を定義する必要はほとんどなくなりましたが、ジェネリクスと型制約の良い学習例となります。