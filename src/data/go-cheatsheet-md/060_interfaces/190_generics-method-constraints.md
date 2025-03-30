## タイトル
title: ジェネリクスのメソッド制約

## タグ
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "メソッドセット"]

## コード
```go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// 制約String() メソッドを持つ
type Stringer interface {
	String() string
}

// ジェネリック関数: Stringer 制約を持つ T のスライスを連結
func JoinToStrings[T Stringer](values []T, sep string) string {
	var builder strings.Builder
	for i, v := range values {
		if i > 0 { builder.WriteString(sep) }
		builder.WriteString(v.String()) // v は String() を持つことが保証される
	}
	return builder.String()
}

// Stringer を実装する型 (例)
type MyInt int
func (i MyInt) String() string { return "MyInt:" + strconv.Itoa(int(i)) }

func main() {
	myInts := []MyInt{1, 2, 3}

	// ジェネリック関数呼び出し (T は MyInt と推論される)
	result := JoinToStrings(myInts, ", ")
	fmt.Println(result) // MyInt:1, MyInt:2, MyInt:3

	// plainInts := []int{4, 5}
	// JoinToStrings(plainInts, "-") // エラー: int は Stringer ではない
}

```

## 解説
```text
ジェネリクスの型制約としてインターフェースを使う
最も基本的な方法は、そのインターフェースが定義する
**メソッドセット**によって型パラメータを制約することです。

**メソッドセットによる制約:**
インターフェース `I` がメソッド `M()` を定義している場合、
型パラメータ `T` に `[T I]` という制約を付けると、
`T` として渡される型は必ず `M()` メソッドを持つことが
保証されます。
これにより、ジェネリックコード内で `T` 型の値 `v` に対し
`v.M()` を安全に呼び出せます。

コード例の `JoinToStrings` 関数:
*   `[T Stringer]`: 型パラメータ `T` は `Stringer`
    インターフェース (`String() string` メソッドを持つ) を
    満たす必要がある、という制約です。
*   `values []T`: `Stringer` を満たす任意の型 `T` の
    スライスを受け取ります。
*   `builder.WriteString(v.String())`: ループ内で、
    各要素 `v` に対して `String()` メソッドを呼び出しています。
    `T` が `Stringer` 制約を持つため、この呼び出しは
    常に有効です。

`main` 関数では、`String()` メソッドを持つ `MyInt` 型の
スライス `myInts` を `JoinToStrings` に渡せています。
(同様に `String()` を持つ `Person` 型のスライスも渡せます)

しかし、`String()` メソッドを持たない `int` 型のスライス
`plainInts` を渡そうとすると、`Stringer` 制約を満たせないため
コンパイルエラーになります。

メソッドセットを持つインターフェースを型制約に使うことで、
ジェネリックコード内で特定の操作（メソッド呼び出し）が
可能であることを保証し、型安全性を維持できます。