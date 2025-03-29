## タイトル
title: メソッド: レシーバ型の自動変換

## タグ
tags: ["methods", "レシーバ", "値レシーバ", "ポインタレシーバ", "ポインタ", "アドレス", "デリファレンス"]

## コード
```go
package main

import "fmt"

type Counter struct{ count int }

// 値レシーバメソッド
func (c Counter) Value() int {
	fmt.Println("  (Value() called)")
	return c.count
}

// ポインタレシーバメソッド
func (c *Counter) Increment() {
	fmt.Println("  (Increment() called)")
	if c == nil { return }
	c.count++
}

func main() {
	var c1 Counter        // 値変数
	c2 := &Counter{count: 10} // ポインタ変数

	fmt.Println("--- 値変数 c1 で呼び出し ---")
	fmt.Printf("c1.Value(): %d\n", c1.Value())     // 値 -> 値レシーバ (OK)
	c1.Increment()                             // 値 -> ポインタレシーバ (OK: &c1 が渡る)
	fmt.Printf("Increment() 後 c1.count: %d\n", c1.count)

	fmt.Println("\n--- ポインタ変数 c2 で呼び出し ---")
	fmt.Printf("c2.Value(): %d\n", c2.Value())     // ポインタ -> 値レシーバ (OK: *c2 が渡る)
	c2.Increment()                             // ポインタ -> ポインタレシーバ (OK)
	fmt.Printf("Increment() 後の c2.count: %d\n", c2.count)
}

```

## 解説
```text
メソッド呼び出し時、レシーバの型 (`T` or `*T`) と
呼び出す変数の型 (`T` or `*T`) が一致しなくても、
多くの場合 Go が自動的に型を合わせてくれます。

**自動変換パターン:**
`T` 型の値 `v`、`*T` 型のポインタ `p` があるとする。

1.  **値レシーバメソッド `func (recv T) M()`:**
    *   `v.M()`: OK (値のコピーが渡る)
    *   `p.M()`: OK (Goが `*p` を自動で渡す)

2.  **ポインタレシーバメソッド `func (recv *T) M()`:**
    *   `p.M()`: OK (ポインタ `p` が渡る)
    *   `v.M()`: OK (Goが `&v` を自動で渡す。ただし `v` が**アドレス可能**な場合のみ)

**アドレス可能 (Addressable):**
変数のようにメモリアドレスを取得できる値のこと。
リテラル (`Counter{}`) や関数の戻り値などは通常アドレス不可。

コード例では、値変数 `c1` からポインタレシーバ `Increment` を、
ポインタ変数 `c2` から値レシーバ `Value` を呼び出せています。
これはGoの自動変換のおかげです。

**注意:**
ポインタレシーバメソッドは、リテラルなどアドレス取得できない値からは
直接呼び出せません (`Counter{}.Increment()` はエラー)。

この自動変換により、呼び出し側はレシーバの型を常に意識せず
シンプルにメソッドを呼び出せます。ただし、ポインタレシーバが
アドレス可能な値でのみ有効な点は注意が必要です。