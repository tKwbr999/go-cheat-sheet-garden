---
title: "基本の型: 文字列 (String)"
tags: ["basic-types", "文字列", "string", "不変"]
---

プログラムで扱うデータの中で、テキスト情報（文章、名前、メッセージなど）は非常に重要です。Go言語では、このようなテキストデータを扱うための基本的な型として**文字列 (String)** 型が用意されています。

## 文字列型 (`string`) とは？

Goの `string` 型は、一連の**バイト (byte)** のシーケンス（並び）を表します。通常、これらのバイトは **UTF-8** エンコーディングされたテキストデータを保持します。UTF-8は、ASCII文字（アルファベット、数字など）だけでなく、日本語のような多バイト文字も効率的に表現できる標準的な文字エンコーディングです。

文字列は**ダブルクォート `"`** で囲んで表現します（例: `"Hello, World!"`, `"こんにちは"`）。

## 文字列の重要な特性: 不変性 (Immutability)

Goの文字列は**不変 (immutable)** です。これは、**一度作成した文字列の内容（バイトシーケンス）を後から変更することはできない**という重要な特性を意味します。

文字列の一部を変更したい場合は、変更後の内容を持つ**新しい文字列を作成**する必要があります。

## 文字列の宣言

変数宣言と同様に、`var` や `:=` を使って文字列型の変数を宣言できます。

```go title="文字列型の宣言例"
package main

import "fmt"

func main() {
	// var を使った宣言
	var greeting string = "Hello, Go!" // 型を明示的に指定
	var name = "Gopher"             // 型を省略 (右辺から string と推論)

	// := を使った宣言 (関数内のみ)
	message := "Welcome to the Go world!" // 型推論により string になる

	// 空文字列
	emptyStr1 := ""
	var emptyStr2 string // ゼロ値も空文字列 ""

	fmt.Println(greeting)
	fmt.Println("名前:", name)
	fmt.Println(message)
	fmt.Println("空文字列1:", emptyStr1)
	fmt.Println("空文字列2 (ゼロ値):", emptyStr2)

	// 文字列の不変性を確認
	// greeting[0] = 'h' // このような操作はコンパイルエラーになります！
	// エラーメッセージ例: cannot assign to greeting[0] (strings are immutable)

	// 文字列を変更したい場合は、新しい文字列を作成する
	newGreeting := "Hi, Go!" // greeting とは別の新しい文字列
	fmt.Println("新しい挨拶:", newGreeting)
}

/* 実行結果:
Hello, Go!
名前: Gopher
Welcome to the Go world!
空文字列1:
空文字列2 (ゼロ値):
新しい挨拶: Hi, Go!
*/
```

**コード解説:**

*   文字列リテラルはダブルクォート `"` で囲みます。
*   `var greeting string = "..."` のように型を明示するか、`var name = "..."` や `message := "..."` のように型推論を利用して宣言できます。
*   文字列型のゼロ値は空文字列 `""` です。
*   コメントアウトされている `greeting[0] = 'h'` の行は、文字列の不変性を示すためのものです。文字列の特定の位置の文字（バイト）を直接変更しようとするとコンパイルエラーになります。

Goの文字列はUTF-8エンコーディングと不変性という特徴を持っています。次のセクションでは、改行などを含む複数行の文字列を扱う方法を見ていきます。