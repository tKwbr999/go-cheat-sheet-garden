## タイトル
title: メソッド: メソッド式 (ポインタレシーバ)

## タグ
tags: ["methods", "メソッド式", "関数型", "レシーバ", "ポインタレシーバ", "ポインタ"]

## コード
```go
package main

import "fmt"

type Counter struct{ count int }

// ポインタレシーバメソッド
func (c *Counter) Increment() {
	if c == nil { return }
	c.count++
}

func main() {
	c := Counter{count: 5}
	cPtr := &c

	// ポインタレシーバメソッドのメソッド式を取得
	// (*Counter).Increment または Counter.Increment
	incrementFunc := (*Counter).Increment
	fmt.Printf("メソッド式の型: %T\n", incrementFunc) // func(*main.Counter)

	// メソッド式を関数として呼び出す
	// 第1引数にはレシーバのポインタ (*Counter) を渡す
	incrementFunc(&c) // 値 c のアドレスを渡す
	fmt.Printf("incrementFunc(&c) 後: c.count = %d\n", c.count) // 6

	incrementFunc(cPtr) // ポインタ変数 cPtr を渡す
	fmt.Printf("incrementFunc(cPtr) 後: c.count = %d\n", c.count) // 7

	// incrementFunc(c) // コンパイルエラー: 型が違う
}

```

## 解説
```text
メソッド式は**ポインタレシーバ**を持つメソッドにも使えます。

**ポインタレシーバメソッドのメソッド式:**
`func (recv *T) M(args...)` に対するメソッド式は、
`(*T).M` または `T.M` と書けます。

これは、**第一引数としてレシーバのポインタ (`*T`) を
受け取る**関数値になります。
**関数型:** `func(recv *T, args...)`

コード例では `(*Counter).Increment` (または `Counter.Increment`) で
`Increment` メソッド (ポインタレシーバ) のメソッド式を取得し、
`incrementFunc` (型 `func(*main.Counter)`) に代入しています。

**呼び出し:**
メソッド式 `incrementFunc` を呼び出す際は、
第一引数に**ポインタ (`*Counter`)** を渡す必要があります。
*   `incrementFunc(&c)`: 値変数 `c` のアドレス `&c` を渡す。
*   `incrementFunc(cPtr)`: ポインタ変数 `cPtr` をそのまま渡す。

**注意:**
`incrementFunc(c)` のように**値**を直接渡そうとすると
コンパイルエラーになります。メソッド式は通常の関数値なので、
通常のメソッド呼び出し (`c.Increment()`) のような
レシーバ型の自動変換（値からポインタへ）は**行われません**。
第一引数には明示的にポインタを渡す必要があります。

**(比較)** 値レシーバメソッド `func (recv T) M()` の
メソッド式 `T.M` は `func(recv T, args...)` 型となり、
第一引数には**値**を渡します。

メソッド式を使う際は、元のメソッドのレシーバが
値かポインタかによって、生成される関数値の第一引数の型と
呼び出し方が異なる点を理解することが重要です。