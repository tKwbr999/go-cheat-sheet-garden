---
title: "短縮変数宣言 `:=`: より簡潔に書く"
tags: ["basics", "変数", "型推論", ":="]
---

Go言語には、変数の宣言と初期化をより簡潔に書くための**短縮変数宣言** `:=` が用意されています。これは関数内でのみ使用でき、非常に頻繁に使われます。

## `:=` を使った変数宣言

`:=` を使うと、`var` キーワードと型指定を省略して変数を宣言・初期化できます。Goコンパイラが右辺の値から**型を推論**してくれます。

```go title="短縮変数宣言 `:=` の使用例"
package main

import "fmt"

func main() {
	// 短縮変数宣言 `:=` を使用
	// 構文: 変数名 := 初期値
	language := "Go"      // 右辺の "Go" から string 型だと推論される
	version := 1.22       // 右辺の 1.22 から float64 型だと推論される (デフォルト)
	released := true      // 右辺の true から bool 型だと推論される
	creationYear := 2009 // 右辺の 2009 から int 型だと推論される (デフォルト)

	fmt.Println("言語:", language)
	fmt.Println("バージョン:", version)
	fmt.Println("リリース済み:", released)
	fmt.Println("開発開始年:", creationYear)

	// 型を確認してみる (fmt.Printf と %T を使用)
	fmt.Printf("language の型: %T\n", language)
	fmt.Printf("version の型: %T\n", version)
	fmt.Printf("released の型: %T\n", released)
	fmt.Printf("creationYear の型: %T\n", creationYear)
}

/* 実行結果:
言語: Go
バージョン: 1.22
リリース済み: true
開発開始年: 2009
language の型: string
version の型: float64
released の型: bool
creationYear の型: int
*/
```

**コード解説:**

*   `変数名 := 初期値`: これが短縮変数宣言の形です。
    *   `var` と型の記述が不要になります。
    *   コンパイラが `=` の右側にある値（初期値）を見て、自動的に変数の型を決定します（**型推論**）。
    *   例えば `language := "Go"` では、`"Go"` が文字列なので `language` は `string` 型になります。
    *   `version := 1.22` では、`1.22` は小数点を含む数値なので、デフォルトで `float64` 型になります。
    *   `creationYear := 2009` では、`2009` は整数なので、デフォルトで `int` 型になります。

## `var` と `:=` の使い分け

*   **`:=` (短縮変数宣言):**
    *   関数内でのみ使用可能です。
    *   新しい変数を宣言し、同時に初期化する場合に使います。
    *   型を明示する必要がなく、コードが簡潔になります。Goではこちらがよく使われます。
*   **`var`:**
    *   関数内外（パッケージレベル）で使用可能です。
    *   初期値を指定せずに宣言したい場合（ゼロ値で初期化される）。
    *   型を明示的に指定したい場合（例: `var count int64 = 10` のように `int` ではなく `int64` を使いたい場合）。

**注意点:**

*   `:=` は**新しい変数**を宣言する場合にのみ使用できます。既に宣言されている変数に値を再代入する場合は `=` を使います。
    ```go
    count := 10 // 新しい変数 count を宣言・初期化
    count = 20  // 既存の変数 count に 20 を再代入 (:= ではない)
    // count := 30 // エラー: no new variables on left side of :=
    ```
*   `:=` の左辺には、少なくとも1つは新しい変数が含まれている必要があります。
    ```go
    x := 10
    x, y := 20, "hello" // OK: y が新しい変数
    // x := 30 // エラー: x は既に宣言されている
    ```

短縮変数宣言 `:=` を使うことで、Goのコードをより簡潔かつ効率的に記述できます。