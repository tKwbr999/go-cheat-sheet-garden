---
title: "メソッド: メソッド式 (ポインタレシーバ)"
tags: ["methods", "メソッド式", "関数型", "レシーバ", "ポインタレシーバ", "ポインタ"]
---

メソッド式は、**ポインタレシーバ**を持つメソッドに対しても使うことができます。

## ポインタレシーバメソッドのメソッド式

ポインタレシーバを持つメソッド `func (recv *T) MethodName(args...) ...` に対するメソッド式は、`(*T).MethodName` または単に `T.MethodName` と書くことができます。

このメソッド式は、**第一引数としてレシーバのポインタ (`*T`) を受け取る**関数値になります。

**関数型:** `func(recv *T, args...) ...`

## コード例

`Counter` 型の `Increment` メソッド（ポインタレシーバ）を例に見てみましょう。

```go title="メソッド式の使い方 (ポインタレシーバ)"
package main

import "fmt"

type Counter struct {
	count int
}

// Increment メソッド (ポインタレシーバ)
func (c *Counter) Increment() {
	if c == nil {
		return
	}
	c.count++
}

// Value メソッド (値レシーバ、比較用)
func (c Counter) Value() int {
	return c.count
}

func main() {
	c := Counter{count: 5} // 値変数
	cPtr := &c             // ポインタ変数

	// --- 通常のメソッド呼び出し ---
	fmt.Println("--- 通常のメソッド呼び出し ---")
	c.Increment() // Go が自動的に &c を渡す
	fmt.Printf("c.Increment() 後: c.count = %d\n", c.count) // 6
	cPtr.Increment() // ポインタで呼び出し
	fmt.Printf("cPtr.Increment() 後: c.count = %d\n", c.count) // 7

	// --- メソッド式 (ポインタレシーバ) ---
	fmt.Println("\n--- メソッド式 (ポインタレシーバ) ---")
	// メソッド式 (*Counter).Increment または Counter.Increment
	// どちらも func(*Counter) 型の関数値になる
	incrementFunc := (*Counter).Increment // または Counter.Increment でも可
	fmt.Printf("メソッド式の型: %T\n", incrementFunc)

	// メソッド式を関数として呼び出す
	// ★ 第一引数にはレシーバのポインタ (*Counter) を渡す必要がある
	incrementFunc(&c) // 値 c のアドレス (&c) を渡す
	fmt.Printf("incrementFunc(&c) 後: c.count = %d\n", c.count) // 8

	incrementFunc(cPtr) // ポインタ変数 cPtr をそのまま渡す
	fmt.Printf("incrementFunc(cPtr) 後: c.count = %d\n", c.count) // 9

	// incrementFunc(c) // コンパイルエラー: cannot use c (variable of type Counter) as *Counter value in argument to incrementFunc
	// 値を直接渡すことはできない

	// --- 比較: メソッド式 (値レシーバ) ---
	fmt.Println("\n--- メソッド式 (値レシーバ) ---")
	valueFunc := Counter.Value // func(Counter) int 型
	fmt.Printf("メソッド式の型: %T\n", valueFunc)

	// ★ 第一引数にはレシーバの値 (Counter) を渡す
	val1 := valueFunc(c) // 値 c を渡す
	fmt.Printf("valueFunc(c) = %d\n", val1) // 9

	// ポインタ cPtr を渡しても、Go が自動的にデリファレンス (*cPtr) してくれる
	val2 := valueFunc(*cPtr) // または valueFunc(*cPtr) と明示的にデリファレンス
	fmt.Printf("valueFunc(*cPtr) = %d\n", val2) // 9
}

/* 実行結果:
--- 通常のメソッド呼び出し ---
c.Increment() 後: c.count = 6
cPtr.Increment() 後: c.count = 7

--- メソッド式 (ポインタレシーバ) ---
メソッド式の型: func(*main.Counter)
incrementFunc(&c) 後: c.count = 8
incrementFunc(cPtr) 後: c.count = 9

--- メソッド式 (値レシーバ) ---
メソッド式の型: func(main.Counter) int
valueFunc(c) = 9
valueFunc(*cPtr) = 9
*/
```

**コード解説:**

*   `incrementFunc := (*Counter).Increment`: ポインタレシーバメソッド `Increment` のメソッド式を取得します。`Counter.Increment` と書いても同じ結果になります。`incrementFunc` の型は `func(*main.Counter)` です。
*   `incrementFunc(&c)`: メソッド式 `incrementFunc` を呼び出す際、第一引数としてレシーバの**ポインタ** (`&c`) を渡す必要があります。これにより、元の変数 `c` の値が変更されます。
*   `incrementFunc(cPtr)`: レシーバが既にポインタ変数 `cPtr` であれば、そのまま渡すことができます。
*   `incrementFunc(c)` はコンパイルエラーになります。メソッド式は通常の関数なので、レシーバ型の自動変換（値からポインタへ）は行われません。第一引数には明示的にポインタ (`*Counter`) を渡す必要があります。
*   比較として、値レシーバメソッド `Value` のメソッド式 `valueFunc` は `func(main.Counter) int` 型となり、第一引数には値 (`Counter`) を渡します。この場合、ポインタ `cPtr` を渡すと自動的にデリファレンスされますが、`*cPtr` と明示的に書くこともできます。

メソッド式を使う場合、元のメソッドが値レシーバかポインタレシーバかによって、生成される関数値の第一引数の型（値かポインタか）が決まり、呼び出し方もそれに合わせる必要があることを理解しておくことが重要です。