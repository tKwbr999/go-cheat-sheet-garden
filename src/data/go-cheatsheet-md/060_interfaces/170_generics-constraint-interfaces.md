## タイトル
title: インターフェース: ジェネリクスの型制約としての利用

## タグ
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint"]

## コード
```go
package main

import "fmt"

// 型リストによる制約: int または float64 を許容
type Number interface {
	int | float64
	// ~int | ~float64 のように ~ を付けると基底型が int/float64 の型も許容
}

// ジェネリック関数: Number 制約を持つ型 T を受け取る
func Double[T Number](value T) T {
	// T は int か float64 なので * 2 が可能
	return value * 2
}

// 比較可能な型を制約する組み込みの comparable
func AreEqual[T comparable](a, b T) bool {
	return a == b
}

func main() {
	fmt.Println("Double(5):", Double(5))       // T=int
	fmt.Println("Double(3.14):", Double(3.14)) // T=float64
	// Double("hello") // エラー: string は Number 制約を満たさない

	fmt.Println("AreEqual(1, 1):", AreEqual(1, 1)) // T=int
	// AreEqual([]int{1}, []int{1}) // エラー: スライスは比較不可
}

```

## 解説
```text
Go 1.18 で導入された**ジェネリクス**では、
**型パラメータ** (`[T any]`) が受け入れ可能な型を
指定する**型制約 (Type Constraint)** として
**インターフェース**を使います。

**なぜ制約が必要か？**
ジェネリック関数内で型パラメータ `T` の値に対し、
特定の操作（メソッド呼び出し、演算子 `+` `<` `==` など）を
行いたい場合、`T` がその操作をサポートすることを
コンパイラに伝える必要があるためです。

**インターフェースによる型制約:**
1.  **メソッドセットによる制約:**
    従来通り、特定のメソッドを持つ型に制約します。
    ```go
    type Stringer interface { String() string }
    func Print[T Stringer](v T) { fmt.Println(v.String()) }
    ```
    `T` は `String()` メソッドを持つ型に限定されます。

2.  **型リストによる制約 (Go 1.18+):**
    インターフェース定義内で、メソッドの代わりに
    具体的な型のリストを `|` で区切って列挙します。
    ```go
    type Number interface { int | float64 }
    func Double[T Number](v T) T { return v * 2 }
    ```
    `Number` は、型パラメータが `int` または `float64` の
    いずれかでなければならない、という制約を定義します。
    これにより `Double` 関数内で `* 2` 演算が安全に行えます。
    `~int` のように `~` を付けると、基底型が `int` である
    独自型 (`type MyInt int`) も許容します。

**組み込みの制約:**
*   `comparable`: `==` や `!=` で比較可能な型を表す
    組み込みインターフェース。
    コード例の `AreEqual` 関数で使われています。
*   `constraints.Ordered`: `golang.org/x/exp/constraints`
    パッケージで定義され、大小比較 (`<`, `>` 等) が可能な
    型（整数、浮動小数点数、文字列）を表します。

インターフェースはジェネリクスにおいて、型パラメータが
持つべきメソッドや許可される型を指定する重要な役割を果たし、
型安全な汎用コードを実現します。