## タイトル
title: 文字列 (String)

## タグ
tags: ["basic-types", "文字列", "string", "不変"]

## コード
```go
package main

import "fmt"

func main() {
	var greeting string = "Hello, Go!"
	var name = "Gopher"
	message := "Welcome!"

	emptyStr1 := ""
	var emptyStr2 string // ゼロ値は ""

	fmt.Println(greeting)
	fmt.Println("名前:", name)
	fmt.Println(message)
	fmt.Println("空文字列1:", emptyStr1)
	fmt.Println("空文字列2:", emptyStr2)

	// greeting[0] = 'h' // コンパイルエラー (不変のため)

	newGreeting := "Hi, Go!" // 新しい文字列を作成
	fmt.Println("新しい挨拶:", newGreeting)
}
```

## 解説
```text
**文字列 (`string`)** はテキストデータを扱うための
基本的な型です。Goの文字列は一連の**バイト**の
シーケンスで、通常は **UTF-8** エンコーディングされた
テキストデータを保持します。

文字列リテラルは**ダブルクォート `"`** で囲みます
(例: `"Hello"`, `"こんにちは"`)。

**重要な特性: 不変性 (Immutability)**
Goの文字列は**不変**です。
つまり、一度作成した文字列の内容を
後から変更することはできません。
(例: `greeting[0] = 'h'` はコンパイルエラー)
変更が必要な場合は、新しい文字列を作成します。

**宣言方法:**
`var` や `:=` を使って宣言できます。
*   `var greeting string = "..."` (型明示)
*   `var name = "..."` (型推論)
*   `message := "..."` (型推論、関数内のみ)

**ゼロ値:**
文字列型のゼロ値は空文字列 `""` です。