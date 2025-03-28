---
title: "制御構文: `if` 文を使ったエラーチェック"
tags: ["flow-control", "if", "エラー処理", "error", "nil"]
---

Go言語では、エラーが発生する可能性のある関数は、戻り値の一つとして `error` 型の値を返すのが一般的です。エラーが発生しなかった場合は `nil` を、エラーが発生した場合は具体的なエラー情報を持つ `error` 型の値を返します。

関数の呼び出し元は、この戻り値のエラーをチェックし、適切に処理する必要があります。このエラーチェックに `if` 文と初期化ステートメントを組み合わせるのが、Goで非常に一般的なイディオム（慣用的な書き方）です。

## Goのエラー処理の基本

*   エラーが発生する可能性のある関数は、最後の戻り値として `error` 型を返すように設計されます。
*   エラーがなければ `nil` を、エラーがあれば `nil` でない `error` 値を返します。
*   関数を呼び出した側は、戻り値の `error` が `nil` かどうかをチェックします。
*   `nil` でなければエラーが発生したと判断し、エラー処理（ログ出力、関数の早期リターンなど）を行います。

## `if err := ...; err != nil` パターン

`if` 文の初期化ステートメントを使うと、エラーを返す可能性のある関数を呼び出し、その戻り値のエラーをすぐにチェックするという一連の流れを非常に簡潔に書くことができます。

```go title="if と初期化ステートメントによるエラーチェック"
package main

import (
	"errors" // errors.New で簡単なエラーを作成できる
	"fmt"
	"strconv" // Atoi はエラーを返す可能性がある
)

// エラーを返す可能性のあるダミー関数
func processData(input string) (string, error) {
	// Atoi で文字列を整数に変換しようとする
	value, err := strconv.Atoi(input)
	if err != nil {
		// Atoi でエラーが発生したら、それをラップして返す
		// fmt.Errorf でエラーメッセージをフォーマットできる
		return "", fmt.Errorf("入力値 '%s' の変換に失敗しました: %w", input, err)
	}

	// 成功した場合の処理 (例: 数値を2倍して文字列で返す)
	result := fmt.Sprintf("処理結果: %d", value*2)
	return result, nil // 成功時はエラーとして nil を返す
}

// 別のエラーを返す可能性のある関数
func checkSomething() error {
	// ここでは単純にエラーを返す例
	return errors.New("何か問題が発生しました")
}

func main() {
	// --- パターン1: 戻り値とエラーの両方を受け取る ---
	fmt.Println("--- パターン1 ---")
	result1, err1 := processData("123")
	// 初期化ステートメントで関数を呼び出し、err1 をチェック
	if err1 != nil {
		// エラー処理
		fmt.Println("エラー発生:", err1)
		// return // main 関数以外ならここで return することが多い
	} else {
		// 正常処理
		fmt.Println("成功:", result1)
	}

	result2, err2 := processData("abc")
	if err2 != nil {
		fmt.Println("エラー発生:", err2)
	} else {
		fmt.Println("成功:", result2)
	}

	// --- パターン2: エラーのみをチェックする ---
	fmt.Println("\n--- パターン2 ---")
	// 関数の戻り値が error のみの場合
	if err3 := checkSomething(); err3 != nil {
		// err3 はこの if ブロック内でのみ有効
		fmt.Println("エラー発生:", err3)
	} else {
		fmt.Println("checkSomething は成功しました。")
	}

	// fmt.Println(err3) // エラー: err3 は if ブロックの外では未定義
}

/* 実行結果:
--- パターン1 ---
成功: 処理結果: 246
エラー発生: 入力値 'abc' の変換に失敗しました: strconv.Atoi: parsing "abc": invalid syntax

--- パターン2 ---
エラー発生: 何か問題が発生しました
*/
```

**コード解説:**

*   `result1, err1 := processData("123")`: `processData` を呼び出し、結果を `result1` に、エラーを `err1` に代入します。
*   `if err1 != nil { ... }`: 直後に `err1` が `nil` でない（エラーがある）かをチェックします。
*   `if err3 := checkSomething(); err3 != nil { ... }`: `checkSomething` を呼び出し、その戻り値（`error` 型）を `err3` に代入し、すぐに `err3 != nil` でエラーチェックを行っています。
*   この構文で宣言された `err1`, `err2`, `err3` といったエラー変数は、それぞれの `if` ブロック（および関連する `else` ブロック）の中だけで有効です。これにより、エラー変数が意図せず他の場所で使われるのを防ぎます。

**利点:**

*   **エラー処理の局所化:** エラーが発生する可能性のある処理の直後にエラーハンドリングを書けるため、コードの流れが分かりやすくなります。
*   **変数のスコープ限定:** エラー変数 (`err`) のスコープが `if` 文内に限定されるため、コード全体の見通しが良くなります。
*   **簡潔な記述:** 関数呼び出しとエラーチェックを一行で書けます。

この `if err := ...; err != nil` パターンは、Goのコードを書く上で非常に頻繁に登場する基本的なエラー処理の方法です。