---
title: "基本の型: 文字列と整数の変換 (Itoa, Atoi)"
tags: ["basic-types", "型変換", "文字列", "string", "整数", "int", "strconv", "Itoa", "Atoi", "エラー処理"]
---

プログラムでは、数値を文字列として表示したり、ユーザーが入力した文字列を数値として扱ったりする場面がよくあります。Go言語では、このような文字列と数値（特に整数）の間の変換を行うために、標準ライブラリの `strconv` パッケージが提供されています。

`strconv` は "string conversion" (文字列変換) の略です。

## 整数 (`int`) から 文字列 (`string`) へ: `strconv.Itoa()`

`strconv.Itoa()` 関数は、`int` 型の整数を受け取り、それを10進数表現の文字列に変換します。`Itoa` は "Integer to ASCII" の略です。

```go title="Itoa による整数から文字列への変換"
package main

import (
	"fmt"
	"strconv" // 文字列変換パッケージをインポート
)

func main() {
	number := 12345
	negativeNumber := -678

	// Itoa を使って int を string に変換
	strNumber := strconv.Itoa(number)
	strNegative := strconv.Itoa(negativeNumber)

	fmt.Printf("数値: %d (%T)\n", number, number)
	fmt.Printf("変換後の文字列: \"%s\" (%T)\n", strNumber, strNumber)

	fmt.Printf("\n数値: %d (%T)\n", negativeNumber, negativeNumber)
	fmt.Printf("変換後の文字列: \"%s\" (%T)\n", strNegative, strNegative)

	// 連結などの文字列操作が可能になる
	message := "商品番号: " + strNumber
	fmt.Println("\n連結例:", message)
}

/* 実行結果:
数値: 12345 (int)
変換後の文字列: "12345" (string)

数値: -678 (int)
変換後の文字列: "-678" (string)

連結例: 商品番号: 12345
*/
```

## 文字列 (`string`) から 整数 (`int`) へ: `strconv.Atoi()`

`strconv.Atoi()` 関数は、10進数表現の文字列を受け取り、それを `int` 型の整数に変換します。`Atoi` は "ASCII to Integer" の略です。

**重要な注意点:** 文字列から数値への変換は、**失敗する可能性**があります（例: 文字列が数値として解釈できない場合）。そのため、`Atoi` 関数は二つの値を返します。

1.  変換後の `int` 型の数値（成功した場合）。
2.  `error` 型の値。変換が成功した場合は `nil` (エラーなし)、失敗した場合はエラー情報が返されます。

**変換が失敗する可能性があるため、`Atoi` を使う際は必ずエラーチェックを行う必要があります。**

```go title="Atoi による文字列から整数への変換とエラー処理"
package main

import (
	"fmt"
	"strconv"
)

func main() {
	str1 := "9876"
	str2 := " -123 " // 前後の空白は無視される場合がある (実装によるが、Atoi は通常トリムする)
	str3 := "456abc" // 数値として解釈できない文字列
	str4 := "123.45" // 整数ではない

	// Atoi を使って string を int に変換 (エラーチェックあり)
	num1, err1 := strconv.Atoi(str1)
	if err1 != nil {
		// エラーが発生した場合の処理
		fmt.Printf("文字列 \"%s\" の変換に失敗しました: %v\n", str1, err1)
	} else {
		// 成功した場合の処理
		fmt.Printf("文字列 \"%s\" -> 数値: %d (%T)\n", str1, num1, num1)
	}

	num2, err2 := strconv.Atoi(str2)
	if err2 != nil {
		fmt.Printf("文字列 \"%s\" の変換に失敗しました: %v\n", str2, err2)
	} else {
		fmt.Printf("文字列 \"%s\" -> 数値: %d (%T)\n", str2, num2, num2)
	}

	num3, err3 := strconv.Atoi(str3)
	if err3 != nil {
		fmt.Printf("文字列 \"%s\" の変換に失敗しました: %v\n", str3, err3)
	} else {
		fmt.Printf("文字列 \"%s\" -> 数値: %d (%T)\n", str3, num3, num3)
	}

	num4, err4 := strconv.Atoi(str4)
	if err4 != nil {
		fmt.Printf("文字列 \"%s\" の変換に失敗しました: %v\n", str4, err4)
	} else {
		fmt.Printf("文字列 \"%s\" -> 数値: %d (%T)\n", str4, num4, num4)
	}

	// エラーを無視すると危険！ (非推奨)
	// num5, _ := strconv.Atoi(str3) // エラーが発生しても気づかない
	// fmt.Println("エラー無視:", num5) // num5 には 0 が入っている可能性が高いが、保証されない
}

/* 実行結果:
文字列 "9876" -> 数値: 9876 (int)
文字列 " -123 " -> 数値: -123 (int)
文字列 "456abc" の変換に失敗しました: strconv.Atoi: parsing "456abc": invalid syntax
文字列 "123.45" の変換に失敗しました: strconv.Atoi: parsing "123.45": invalid syntax
*/
```

**コード解説:**

*   `num, err := strconv.Atoi(str)`: `Atoi` は変換結果の数値 `num` とエラー情報 `err` を返します。
*   `if err != nil { ... }`: `Atoi` の呼び出し直後に、`err` が `nil` でない（つまりエラーが発生した）かどうかをチェックするのが定石です。エラーがあれば適切な処理（エラーメッセージの表示、デフォルト値の使用、プログラムの終了など）を行います。
*   エラーチェックを怠ると、変換に失敗した場合に意図しない値（多くは `0`）が使われてしまい、バグの原因となります。

`strconv` パッケージには、`Itoa`, `Atoi` 以外にも、様々な基数（2進数、16進数など）や型（`float`, `bool` など）との間で文字列変換を行うための関数が多数用意されています（例: `ParseInt`, `FormatInt`, `ParseFloat`, `FormatFloat` など）。これらについては、必要に応じて後のセクションで触れます。