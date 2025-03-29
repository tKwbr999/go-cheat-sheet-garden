## タイトル
title: 短縮変数宣言 `:=`: より簡潔に書く

## タグ
tags: ["basics", "変数", "型推論", ":="]

## コード
```go
package main

import "fmt"

func main() {
	// 短縮変数宣言 `:=` を使用
	// var と型指定を省略でき、型は右辺から推論される
	language := "Go"      // string と推論
	version := 1.22       // float64 と推論
	released := true      // bool と推論
	year := 2009          // int と推論

	fmt.Println(language, version, released, year)
	fmt.Printf("Type of year: %T\n", year) // Type of year: int

	// 再代入は `=` を使う
	year = 2024
	// year := 2025 // エラー: no new variables on left side of :=

	// 少なくとも一つ新しい変数があれば `:=` を使える
	year, month := 2025, 3 // OK: month が新しい
	fmt.Println(year, month)
}

```

## 解説
```text
Goには、変数の宣言と初期化をより簡潔に書くための
**短縮変数宣言 `:=`** があります。**関数内でのみ**使用でき、
非常に頻繁に使われます。

**使い方:**
`変数名 := 初期値`
*   `var` キーワードと型指定を省略できます。
*   Goコンパイラが右辺の初期値から**型を推論**します。
    *   `"Go"` -> `string`
    *   `1.22` -> `float64` (デフォルト)
    *   `true` -> `bool`
    *   `2009` -> `int` (デフォルト)

**`var` と `:=` の使い分け:**
*   **`:=`**: 関数内で新しい変数を宣言・初期化する場合に推奨。簡潔。
*   **`var`**:
    *   関数外 (パッケージレベル) での宣言。
    *   初期値を指定せずゼロ値で初期化したい場合。
    *   型を明示的に指定したい場合 (例: `var count int64 = 10`)。

**注意点:**
*   `:=` は**新しい変数**の宣言にのみ使用。既存変数への再代入は `=`。
*   `:=` の左辺には、少なくとも1つは新しい変数が含まれている必要がある。

短縮変数宣言 `:=` はGoのコードを簡潔にするための重要な機能です。