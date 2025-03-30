## タイトル
title: メソッドによる型制約 (`fmt.Stringer` など)

## タグ
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "interface", "メソッドセット", "Stringer"]

## コード
```go
package main

import (
	"fmt"
	"strings"
)

// ジェネリック関数 Join: T は fmt.Stringer を満たす必要がある
func Join[T fmt.Stringer](values []T, sep string) string {
	var sb strings.Builder
	for i, v := range values {
		if i > 0 { sb.WriteString(sep) }
		// ★ v.String() メソッドを呼び出せる (制約で保証) ★
		sb.WriteString(v.String())
	}
	return sb.String()
}

// fmt.Stringer を実装する型
type Person struct { Name string; Age int }
func (p Person) String() string { // Stringer を満たす
	return fmt.Sprintf("%s(%d)", p.Name, p.Age)
}

// type IPAddr [4]byte
// func (ip IPAddr) String() string { ... } // これも Stringer

func main() {
	people := []Person{{"Alice", 30}, {"Bob", 25}}
	// T=Person (Stringer を満たす)
	peopleStr := Join(people, ", ")
	fmt.Println("People:", peopleStr) // People: Alice(30), Bob(25)

	// addrs := []IPAddr{{127,0,0,1}, {192,168,1,1}}
	// addrsStr := Join(addrs, "; ") // これも OK

	// nums := []int{1, 2}
	// Join(nums, "-") // コンパイルエラー (int は Stringer ではない)
}

```

## 解説
```text
型パラメータに制約を課すもう一つの方法は、
**メソッドセット**を持つインターフェースを使うことです。
これにより、型パラメータが特定のメソッドを持つことを保証できます。

**メソッドセットによる制約:**
*   型制約として、メソッドシグネチャを持つインターフェースを指定。
    `type MyInterface interface { MethodA() }`
*   ジェネリック関数/型で `[T MyInterface]` のように指定。
*   `T` は `MyInterface` が要求する全メソッドを持つ必要がある。
*   関数内では `T` 型の値に対し、制約インターフェースのメソッド
    (`v.MethodA()`) を安全に呼び出せる。

**標準インターフェースの利用: `fmt.Stringer`**
よく使われるのが `fmt.Stringer` です。
```go
type Stringer interface { String() string }
```
`String()` メソッドを持つ型 (人間が読める文字列表現を提供) を示します。
これを制約に使うと「`String()` メソッドを持つ任意の型」を受け入れられます。

コード例の `Join[T fmt.Stringer]` 関数は、`fmt.Stringer` を満たす
任意の型のスライスを受け取り、各要素の `v.String()` メソッドを
呼び出して結果を結合します。
`Person` 型は `String()` を実装しているので `Join` に渡せますが、
`int` 型は `String()` を持たないのでコンパイルエラーになります。

メソッドセットを持つインターフェースを型制約に使うことで、
ジェネリックコードが特定の振る舞いを持つ型に対して
安全に動作することを保証できます。