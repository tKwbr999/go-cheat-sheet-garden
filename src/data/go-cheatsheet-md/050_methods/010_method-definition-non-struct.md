## タイトル
title: メソッド: 構造体以外の型へのメソッド定義

## タグ
tags: ["methods", "type", "レシーバ", "func"]

## コード
```go
package main

import "fmt"

// int を基にした新しい型 MyInt
type MyInt int

// MyInt 型に対する IsEven メソッド (値レシーバ)
func (m MyInt) IsEven() bool {
	return m%2 == 0
}

// MyInt 型に対する Add メソッド (ポインタレシーバ)
func (m *MyInt) Add(n MyInt) {
	if m == nil { return }
	*m += n // 元の値を変更
}

func main() {
	var num1 MyInt = 10
	num2 := MyInt(25)

	// IsEven メソッド呼び出し
	fmt.Printf("%d は偶数か？ %t\n", num1, num1.IsEven())
	fmt.Printf("%d は偶数か？ %t\n", num2, num2.IsEven())

	// Add メソッド呼び出し (ポインタレシーバ)
	fmt.Printf("Add(5) 前: %d\n", num1)
	(&num1).Add(5) // アドレスを渡して呼び出す
	fmt.Printf("Add(5) 後: %d\n", num1) // num1 の値が変更される

	// numPtr := &num2
	// numPtr.Add(10) // ポインタ変数経由でも呼び出せる
}

```

## 解説
```text
メソッドは構造体だけでなく、**`type` キーワードで
定義された任意の型**（ポインタ型やインターフェース型自体を除く）
に対しても定義できます。
これにより、`int` や `string` などを基にした独自型に
振る舞いを追加できます。

**構文:** 構造体の場合と同じです。
`func (レシーバ名 レシーバ型) メソッド名(...) ...`
`レシーバ型` に `type` で定義した型名を指定します。

コード例では `type MyInt int` で新しい型 `MyInt` を定義し、
それに対して `IsEven` (値レシーバ) と `Add` (ポインタレシーバ)
というメソッドを定義しています。

*   `MyInt` は `int` とは**異なる型**ですが、基底型が `int` なので
    `%` や `+=` などの整数演算が可能です。
*   `num1.IsEven()` のように `MyInt` 型の変数からメソッドを呼び出せます。
*   `Add` メソッドはポインタレシーバ (`*MyInt`) なので、
    元の値を変更するために `(&num1).Add(5)` のように
    アドレスを渡して呼び出すか、ポインタ変数 (`numPtr`) を
    使って `numPtr.Add(10)` のように呼び出します。

**注意:** 組み込みの `int` 型などに直接メソッドを
追加することはできません。必ず `type` で新しい型を
定義する必要があります。

独自型にメソッドを追加することで、コードの意図を明確にし、
型に特化した振る舞いをカプセル化できます。
(例: `type UserID string` に検証メソッドを追加するなど)