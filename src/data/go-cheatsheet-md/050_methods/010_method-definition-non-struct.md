---
title: "メソッド: 構造体以外の型へのメソッド定義"
tags: ["methods", "type", "レシーバ", "func"]
---

メソッドは構造体 (`struct`) に対して定義されることが多いですが、Go言語では **`type` キーワードを使って定義された任意の型**（ただし、ポインタ型やインターフェース型自体を除く）に対してメソッドを定義することができます。

これにより、`int` や `float64`, `string` などの組み込み型を基にした独自の型を作成し、その型特有の操作（メソッド）を追加することが可能になります。

## 非構造体型へのメソッド定義

基本的な構文は構造体の場合と同じです。

**構文:** `func (レシーバ変数名 レシーバ型) メソッド名(引数リスト) 戻り値リスト { ... }`

*   `レシーバ型`: `type` で定義した型名を指定します（例: `MyInt`, `*MyString`)。

## コード例: 独自整数型 `MyInt`

例として、組み込みの `int` 型を基にした新しい型 `MyInt` を定義し、それに「偶数かどうかを判定する」メソッドと「値を加算する」メソッドを追加してみましょう。

```go title="非構造体型へのメソッド定義"
package main

import "fmt"

// --- 独自型の定義 ---
// int 型を基にした新しい型 MyInt を定義
type MyInt int

// --- MyInt 型に対するメソッド定義 ---

// IsEven メソッド: MyInt の値が偶数かどうかを判定する
// レシーバは m MyInt (値レシーバ)
func (m MyInt) IsEven() bool {
	// レシーバ変数 m は MyInt 型 (基底は int なので数値演算が可能)
	return m%2 == 0
}

// Add メソッド: MyInt の値に別の MyInt の値を加算する
// レシーバは m *MyInt (ポインタレシーバ)
// 元の値を変更するためにはポインタレシーバが必要
func (m *MyInt) Add(n MyInt) {
	if m == nil { // ポインタが nil でないかチェック
		return
	}
	// *m でポインタが指す先の値を取得し、加算して再代入
	*m += n
}

func main() {
	// MyInt 型の変数を作成
	var num1 MyInt = 10
	num2 := MyInt(25) // 型変換を使って MyInt 型の値を作成

	fmt.Printf("num1: %d (型: %T)\n", num1, num1)
	fmt.Printf("num2: %d (型: %T)\n", num2, num2)

	// --- メソッドの呼び出し ---
	// MyInt 型の変数に対してメソッドを呼び出す

	// IsEven メソッド (値レシーバ)
	fmt.Printf("%d は偶数か？ %t\n", num1, num1.IsEven()) // true
	fmt.Printf("%d は偶数か？ %t\n", num2, num2.IsEven()) // false

	// Add メソッド (ポインタレシーバ)
	fmt.Printf("num1 の Add(5) 前: %d\n", num1)
	// num1.Add(5) // 値レシーバのメソッドはポインタ経由でも呼び出せるが、
	// ポインタレシーバのメソッドを値経由で呼び出すと、元の値は変更されない場合がある
	// （Go が暗黙的にアドレスを取って渡すが、メソッド内で変更してもコピーが変更されるだけになることがある）
	// 確実性を期すなら、ポインタレシーバメソッドはポインタで呼び出すのが良い
	(&num1).Add(5) // num1 のアドレスを渡して Add を呼び出す
	fmt.Printf("num1 の Add(5) 後: %d\n", num1) // num1 の値が 15 に変更される

	numPtr := &num2 // num2 のポインタを取得
	fmt.Printf("num2 の Add(10) 前: %d\n", *numPtr)
	numPtr.Add(10) // ポインタ変数で Add を呼び出す
	fmt.Printf("num2 の Add(10) 後: %d\n", *numPtr) // num2 の値が 35 に変更される

	// 組み込みの int 型にはこれらのメソッドは定義されていない
	// var x int = 10
	// fmt.Println(x.IsEven()) // エラー: x.IsEven undefined (type int has no method IsEven)
}

/* 実行結果:
num1: 10 (型: main.MyInt)
num2: 25 (型: main.MyInt)
10 は偶数か？ true
25 は偶数か？ false
num1 の Add(5) 前: 10
num1 の Add(5) 後: 15
num2 の Add(10) 前: 25
num2 の Add(10) 後: 35
*/
```

**コード解説:**

*   `type MyInt int`: `int` を基底とする新しい型 `MyInt` を定義しています。`MyInt` は `int` とは**異なる型**として扱われますが、基底型が `int` なので `%` や `+=` などの整数演算が可能です。
*   `func (m MyInt) IsEven() bool`: `MyInt` 型に対する `IsEven` メソッドを定義しています。レシーバ `m` は `MyInt` 型の値を受け取ります（値レシーバ）。
*   `func (m *MyInt) Add(n MyInt)`: `MyInt` 型に対する `Add` メソッドを定義しています。レシーバ `m` は `*MyInt` 型（`MyInt` へのポインタ）です（ポインタレシーバ）。メソッド内でレシーバが指す先の値 (`*m`) を変更しています。
*   `num1.IsEven()`: `MyInt` 型の変数 `num1` に対して `IsEven` メソッドを呼び出しています。
*   `(&num1).Add(5)`: `num1` のアドレス (`&num1`) を取得し、それに対して `Add` メソッドを呼び出しています。ポインタレシーバなので、`num1` の値が変更されます。
*   `numPtr.Add(10)`: `MyInt` へのポインタ変数 `numPtr` に対して `Add` メソッドを呼び出しています。

このように、`type` で独自の型を定義し、それに対してメソッドを追加することで、コードの意図を明確にし、型に特化した振る舞いをカプセル化することができます。例えば、`type UserID string` や `type Temperature float64` のような型を定義し、それぞれにバリデーションメソッドや単位変換メソッドなどを追加することが考えられます。