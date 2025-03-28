---
title: "インターフェース: ジェネリクスの型制約としての利用"
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint"]
---

Go 1.18 で導入された**ジェネリクス (Generics)** は、特定の型に依存しない汎用的な関数やデータ構造を定義するための機能です。ジェネリクスを使う際には、**型パラメータ (Type Parameter)** に対してどのような型が許容されるかを指定する**型制約 (Type Constraint)** を定義する必要があり、この制約として**インターフェース**が重要な役割を果たします。

## ジェネリクスと型制約の必要性

ジェネリクスを使うと、例えば「任意の型のスライスの合計を計算する」ような関数を書きたくなります。しかし、任意の型 `T` に対して `+` 演算子が使えるとは限りません。そこで、型パラメータ `T` が満たすべき条件（制約）を指定する必要があります。

## インターフェースによる型制約

Goのジェネリクスでは、型制約を定義するためにインターフェースを使います。インターフェースは、型パラメータとして受け入れ可能な型の集合を指定します。これには主に2つの方法があります。

### 1. メソッドセットによる制約

従来からのインターフェースの役割通り、特定の**メソッド**を持つ型に制約することができます。ジェネリック関数内で、型パラメータの型の値に対して、制約インターフェースで定義されたメソッドを呼び出すことができます。

```go title="メソッドセットによる型制約"
package main

import "fmt"

// Stringer インターフェース (再掲)
// String() string メソッドを持つことを要求する
type Stringer interface {
	String() string
}

// ジェネリック関数 PrintString: Stringer インターフェースを満たす任意の型 T を受け取る
// [T Stringer] が型パラメータリストと制約
func PrintString[T Stringer](value T) {
	// value は Stringer インターフェースを満たすことが保証されているので、
	// String() メソッドを呼び出すことができる
	fmt.Println("文字列表現:", value.String())
}

// --- Stringer を満たす型 ---
type MyInt int

func (i MyInt) String() string {
	return fmt.Sprintf("MyInt(%d)", i)
}

type Person struct {
	Name string
}

func (p Person) String() string {
	return fmt.Sprintf("Person(Name=%s)", p.Name)
}

func main() {
	// PrintString は Stringer を満たす MyInt や Person を受け取れる
	PrintString(MyInt(123))
	PrintString(Person{Name: "Alice"})

	// PrintString(10) // エラー: int は Stringer を満たさない (String() メソッドがない)
}

/* 実行結果:
文字列表現: MyInt(123)
文字列表現: Person(Name=Alice)
*/
```

### 2. 型リストによる制約 (Go 1.18+)

インターフェース定義の中で、メソッドだけでなく、**具体的な型のリスト**を `|` で区切って列挙することができます。これにより、そのインターフェースはリストに含まれるいずれかの型であることを制約します。これは、特定の演算子（`+`, `<`, `==` など）を使いたい型を制約する場合に便利です。

```go title="型リストによる型制約"
package main

import "fmt"

// Number インターフェース: int または float64 であることを制約
// メソッドは定義せず、型のリストだけを記述
type Number interface {
	int | float64 // int または float64 型のみを許可
	// int | int8 | int16 | int32 | int64 | uint | ... | float32 | float64 のように複数書ける
}

// ジェネリック関数 Double: Number インターフェースを満たす型 T を受け取る
// T は int または float64 のどちらかであることが保証される
func Double[T Number](value T) T {
	// value は int か float64 なので、* 2 演算が可能
	return value * 2
}

// --- 組み込みの制約: comparable ---
// Go には比較可能 (==, !=) な型を表す comparable という組み込みの制約がある
// これは interface { comparable } と書くのと同じ
func AreEqual[T comparable](a, b T) bool {
	return a == b
}

// --- 組み込みの制約: ordered ---
// constraints パッケージには、順序付け可能 (<, <=, >, >=) な型を表す
// constraints.Ordered が定義されている (整数、浮動小数点数、文字列など)
// import "golang.org/x/exp/constraints"
// func Min[T constraints.Ordered](a, b T) T { ... }

func main() {
	fmt.Println("Double(5):", Double(5))       // T は int
	fmt.Println("Double(3.14):", Double(3.14)) // T は float64
	// fmt.Println(Double("hello")) // エラー: string は Number 制約を満たさない

	fmt.Println("\nAreEqual(10, 10):", AreEqual(10, 10))     // true
	fmt.Println("AreEqual(\"a\", \"b\"):", AreEqual("a", "b")) // false
	// fmt.Println(AreEqual([]int{1}, []int{1})) // エラー: スライスは比較可能ではない
}

/* 実行結果:
Double(5): 10
Double(3.14): 6.28

AreEqual(10, 10): true
AreEqual("a", "b"): false
*/
```

**コード解説:**

*   `type Number interface { int | float64 }`: `Number` は、型パラメータが `int` または `float64` のいずれかでなければならない、という制約を定義しています。
*   `func Double[T Number](value T) T`: 型パラメータ `T` は `Number` 制約を満たす必要があります。関数内では `T` が `int` か `float64` であることが保証されるため、`value * 2` という演算が安全に行えます。
*   `comparable`: これはGoに組み込みで用意されている制約インターフェースで、`==` や `!=` で比較可能な型（数値、文字列、ポインタ、比較可能なフィールドのみを持つ構造体など）を表します。
*   `constraints.Ordered`: `golang.org/x/exp/constraints` パッケージ（将来的に標準ライブラリに入る可能性あり）で定義されており、大小比較 (`<`, `>`, `<=`, `>=`) が可能な型（整数、浮動小数点数、文字列）を表します。

インターフェースは、ジェネリクスにおいて型パラメータが持つべきメソッドや、許可される具体的な型を指定するための重要なツールです。これにより、型安全性を保ちながら汎用的なコードを書くことが可能になります。