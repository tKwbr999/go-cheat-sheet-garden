---
title: "ジェネリクス: メソッドによる型制約 (`fmt.Stringer` など)"
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "interface", "メソッドセット", "Stringer"]
---

型パラメータに制約を課すもう一つの方法は、**メソッドセット**を持つインターフェースを使うことです。これにより、型パラメータとして渡される型が、特定のメソッドを持っていることを保証できます。

## メソッドセットによる制約

*   型制約として、一つ以上のメソッドシグネチャを持つインターフェースを指定します。
    ```go
    type MyInterface interface {
        MethodA() int
        MethodB(string) error
    }
    ```
*   ジェネリック関数や型で、型パラメータにこのインターフェースを制約として指定します (`[T MyInterface]`)。
*   これにより、`T` として渡される型は `MyInterface` が要求するすべてのメソッド (`MethodA` と `MethodB`) を持っている必要があります。
*   関数やメソッドの内部では、`T` 型の値に対して、制約インターフェースで定義されたメソッド (`MethodA()` や `MethodB(...)`) を安全に呼び出すことができます。

## 標準インターフェースの利用: `fmt.Stringer`

よく使われる例として、標準ライブラリの `fmt` パッケージで定義されている `Stringer` インターフェースがあります。

```go
package fmt

type Stringer interface {
    String() string
}
```
このインターフェースは、`String() string` というメソッド一つだけを要求します。このメソッドは、その型の値を人間が読める文字列形式で表現するために使われます (`fmt.Println` なども内部でこのメソッドを利用します)。

`fmt.Stringer` を型制約として使うことで、「`String()` メソッドを持つ任意の型」を受け入れるジェネリック関数を定義できます。

## コード例: `Stringer` スライスの要素を結合する `Join` 関数

`fmt.Stringer` を満たす任意の型のスライスを受け取り、各要素の `String()` メソッドの結果を区切り文字で結合するジェネリック関数 `Join` を実装してみましょう。

```go title="fmt.Stringer 制約を使った Join 関数"
package main

import (
	"fmt"
	"strings" // strings.Builder を使うため
)

// --- ジェネリック関数 Join の定義 ---
// 型パラメータ T に fmt.Stringer 制約を課す
// これにより、T は String() string メソッドを持つことが保証される
func Join[T fmt.Stringer](values []T, sep string) string {
	// 文字列結合を効率的に行うために strings.Builder を使用
	var sb strings.Builder
	for i, v := range values {
		if i > 0 {
			sb.WriteString(sep) // 区切り文字を追加
		}
		// ★ v.String() メソッドを呼び出せる ★
		// T が fmt.Stringer を満たすことが保証されているため、
		// コンパイラはこのメソッド呼び出しを許可する
		sb.WriteString(v.String()) // 各要素の文字列表現を追加
	}
	return sb.String() // 結合された文字列を返す
}

// --- fmt.Stringer を実装する型 ---

// Person 型
type Person struct {
	Name string
	Age  int
}

// Person 型に String() メソッドを実装 (fmt.Stringer を満たす)
func (p Person) String() string {
	return fmt.Sprintf("%s (%d歳)", p.Name, p.Age)
}

// IPAddr 型 (例)
type IPAddr [4]byte

// IPAddr 型に String() メソッドを実装 (fmt.Stringer を満たす)
func (ip IPAddr) String() string {
	return fmt.Sprintf("%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3])
}

func main() {
	// --- Person スライスで Join を使用 ---
	people := []Person{
		{Name: "Alice", Age: 30},
		{Name: "Bob", Age: 25},
		{Name: "Charlie", Age: 35},
	}
	// T = Person (Stringer を満たす)
	peopleStr := Join(people, ", ")
	fmt.Println("People:", peopleStr)
	// 出力: People: Alice (30歳), Bob (25歳), Charlie (35歳)

	// --- IPAddr スライスで Join を使用 ---
	addrs := []IPAddr{
		{127, 0, 0, 1},
		{192, 168, 1, 1},
		{8, 8, 8, 8},
	}
	// T = IPAddr (Stringer を満たす)
	addrsStr := Join(addrs, "; ")
	fmt.Println("Addresses:", addrsStr)
	// 出力: Addresses: 127.0.0.1; 192.168.1.1; 8.8.8.8

	// --- エラーになる例 ---
	// int 型は String() メソッドを持たないため、Stringer を満たさない
	// nums := []int{1, 2, 3}
	// Join(nums, "-") // コンパイルエラー！
}

/* 実行結果:
People: Alice (30歳), Bob (25歳), Charlie (35歳)
Addresses: 127.0.0.1; 192.168.1.1; 8.8.8.8
*/
```

**コード解説:**

*   `func Join[T fmt.Stringer](...)`: 型パラメータ `T` に `fmt.Stringer` 制約を指定しています。
*   `sb.WriteString(v.String())`: `Join` 関数内で、`T` 型の変数 `v` に対して `String()` メソッドを呼び出しています。`T` が `fmt.Stringer` を満たすことが保証されているため、この呼び出しは常に有効です。
*   `Person` 型と `IPAddr` 型は、それぞれ `String() string` メソッドを実装しているため、`fmt.Stringer` インターフェースを満たします。
*   そのため、`[]Person` 型のスライス `people` と `[]IPAddr` 型のスライス `addrs` の両方を `Join` 関数に渡すことができます。`Join` 関数は、それぞれの型の `String()` メソッドを呼び出して結果を結合します。
*   `[]int` 型のスライスを `Join` に渡そうとすると、`int` 型は `String()` メソッドを持たず `fmt.Stringer` を満たさないため、コンパイルエラーになります。

メソッドセットを持つインターフェースを型制約として使うことで、ジェネリックなコードが特定の振る舞い（メソッド）を持つ型に対して安全に動作することを保証できます。これは、Goのインターフェースの力をジェネリクスと組み合わせる強力な方法です。