---
title: "インターフェース: ジェネリクスのメソッド制約"
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "メソッドセット"]
---

ジェネリクスの型制約としてインターフェースを使う最も基本的な方法は、そのインターフェースが定義する**メソッドセット**によって型パラメータを制約することです。これにより、ジェネリックな関数や型の中で、型パラメータが特定のメソッドを持っていることを保証し、安全にそのメソッドを呼び出すことができます。

## メソッドセットによる制約

インターフェース `I` がメソッド `M()` を定義している場合、型パラメータ `T` に対して `[T I]` という制約を付けると、`T` として渡される型は必ず `M()` メソッドを持っていることが保証されます。そのため、ジェネリックなコードの中で `T` 型の値 `v` に対して `v.M()` を呼び出すことができます。

## コード例: `Stringer` 制約を使った `Join` 関数

`fmt.Stringer` インターフェース（`String() string` メソッドを持つ）を型制約として使い、任意の `Stringer` 型のスライスの要素を文字列として連結するジェネリック関数 `JoinToStrings` を作成してみましょう。

```go title="メソッド制約を持つジェネリック関数"
package main

import (
	"fmt"
	"strconv" // strconv.Itoa を使うため
	"strings" // strings.Builder を使うため
)

// --- 制約インターフェース (fmt.Stringer と同じ) ---
type Stringer interface {
	String() string
}

// --- ジェネリック関数 ---
// JoinToStrings: Stringer 制約を満たす任意の型 T のスライスを受け取り、
// 各要素の String() メソッドの結果を sep で連結した文字列を返す
func JoinToStrings[T Stringer](values []T, sep string) string {
	// strings.Builder を使うと効率的に文字列を連結できる
	var builder strings.Builder
	for i, v := range values {
		if i > 0 {
			builder.WriteString(sep) // 区切り文字を追加
		}
		// v は Stringer を満たすことが保証されているので、
		// String() メソッドを安全に呼び出せる
		builder.WriteString(v.String())
	}
	return builder.String()
}

// --- Stringer を実装する型 ---

// MyInt 型 (再掲)
type MyInt int

func (i MyInt) String() string {
	return "MyInt:" + strconv.Itoa(int(i)) // strconv.Itoa は int を受け取る
}

// Person 型 (再掲)
type Person struct {
	Name string
	Age  int
}

func (p Person) String() string {
	return fmt.Sprintf("%s(%d)", p.Name, p.Age)
}

func main() {
	// --- Stringer を満たす型のスライス ---
	myInts := []MyInt{1, 2, 3}
	people := []Person{{"Alice", 30}, {"Bob", 25}}

	// --- ジェネリック関数 JoinToStrings の呼び出し ---
	// MyInt スライスを渡す (MyInt は Stringer を実装)
	// コンパイラが T を MyInt と推論
	result1 := JoinToStrings(myInts, ", ")
	fmt.Printf("JoinToStrings(myInts): %s\n", result1)

	// Person スライスを渡す (Person は Stringer を実装)
	// コンパイラが T を Person と推論
	result2 := JoinToStrings(people, " | ")
	fmt.Printf("JoinToStrings(people): %s\n", result2)

	// --- Stringer を満たさない型のスライス ---
	plainInts := []int{4, 5, 6}
	// JoinToStrings(plainInts, "-") // コンパイルエラー: int does not implement Stringer (missing method String)
	// int 型は String() メソッドを持たないため、Stringer 制約を満たさずエラーになる
}

/* 実行結果:
JoinToStrings(myInts): MyInt:1, MyInt:2, MyInt:3
JoinToStrings(people): Alice(30) | Bob(25)
*/
```

**コード解説:**

*   `type Stringer interface { String() string }`: `String()` メソッドを持つことを要求するインターフェースを定義します（`fmt.Stringer` と同じです）。
*   `func JoinToStrings[T Stringer](values []T, sep string) string`:
    *   `[T Stringer]`: 型パラメータ `T` が `Stringer` インターフェースを満たす必要があることを指定します。
    *   `values []T`: `Stringer` を満たす任意の型 `T` のスライスを受け取ります。
    *   `builder.WriteString(v.String())`: ループ内で、スライスの各要素 `v` に対して `String()` メソッドを呼び出しています。`T` が `Stringer` 制約を持つため、この呼び出しは常に有効であることが保証されます。
*   `MyInt` と `Person` はそれぞれ `String()` メソッドを実装しているため、`Stringer` インターフェースを満たします。
*   `JoinToStrings` 関数は、`[]MyInt` と `[]Person` の両方のスライスを受け入れて、それぞれの `String()` メソッドを使って要素を連結できています。
*   `[]int` 型のスライスを渡そうとすると、`int` 型は `String()` メソッドを持たないため、`Stringer` 制約を満たせずコンパイルエラーになります。

このように、メソッドセットを持つインターフェースを型制約として使うことで、ジェネリックなコードの中で特定の操作（メソッド呼び出し）が可能であることを保証し、型安全性を維持することができます。