## タイトル
title: 文字列と整数の変換 (Itoa, Atoi)

## タグ
tags: ["basic-types", "型変換", "文字列", "string", "整数", "int", "strconv", "Itoa", "Atoi", "エラー処理"]

## コード
```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	str1 := "9876"
	str2 := " -123 "
	str3 := "456abc" // 変換不可
	str4 := "123.45" // 整数ではない

	num1, err1 := strconv.Atoi(str1)
	if err1 != nil {
		fmt.Printf("エラー(%s): %v\n", str1, err1)
	} else {
		fmt.Printf("%s -> %d (%T)\n", str1, num1, num1)
	}

	num2, err2 := strconv.Atoi(str2)
	if err2 != nil {
		fmt.Printf("エラー(%s): %v\n", str2, err2)
	} else {
		fmt.Printf("%s -> %d (%T)\n", str2, num2, num2)
	}

	_, err3 := strconv.Atoi(str3) // 結果は使わないがエラーはチェック
	if err3 != nil {
		fmt.Printf("エラー(%s): %v\n", str3, err3)
	}

	_, err4 := strconv.Atoi(str4)
	if err4 != nil {
		fmt.Printf("エラー(%s): %v\n", str4, err4)
	}
}
```

## 解説
```text
数値と文字列間の変換には、標準ライブラリの
`strconv` ("string conversion") パッケージを使います。

**整数 (`int`) から 文字列 (`string`) へ: `strconv.Itoa()`**
`int` 型の整数を10進数表現の文字列に変換します。
(Itoa: Integer to ASCII)
例: `s := strconv.Itoa(123)` // s は "123" になる

**文字列 (`string`) から 整数 (`int`) へ: `strconv.Atoi()`**
10進数表現の文字列を `int` 型の整数に変換します。
(Atoi: ASCII to Integer)

**重要: `Atoi` のエラー処理**
文字列から数値への変換は、文字列が数値として
解釈できない場合に**失敗する可能性**があります。
そのため、`Atoi` は2つの値を返します。
1.  変換後の `int` 値 (成功時)
2.  `error` 値 (成功時は `nil`, 失敗時はエラー情報)

**`Atoi` を使う際は、必ずエラーチェックを行います。**
```go
num, err := strconv.Atoi(str)
if err != nil {
    // エラー処理 (例: エラーログ出力, デフォルト値使用)
    fmt.Println("変換エラー:", err)
    return
}
// 成功時の処理 (num を使う)
fmt.Println("変換成功:", num)
```
コード例のように、`err` が `nil` でないかを確認します。
エラーチェックを怠ると、変換失敗時に意図しない値
(多くは `0`) が使われ、バグの原因になります。

`strconv` パッケージには、他の基数や型
(float, bool等) との変換関数も多数あります
(例: `ParseInt`, `FormatInt`, `ParseFloat`)。