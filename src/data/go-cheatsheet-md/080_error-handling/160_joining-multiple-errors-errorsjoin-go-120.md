---
title: "エラー処理: 複数のエラーの結合 `errors.Join` (Go 1.20+)"
tags: ["error-handling", "error", "errors", "errors.Join", "エラーラッピング", "Go1.20"]
---

Go 1.20 から、標準ライブラリの `errors` パッケージに **`Join`** 関数が追加されました。これは、**複数の `error` 値を一つにまとめて**、単一の `error` 値として扱うための関数です。

## `errors.Join()` の使い方

`errors.Join()` は、引数として**任意の数の `error` 値**（可変長引数）を受け取ります。

**構文:** `err := errors.Join(err1, err2, ..., errN)`

*   引数として渡された `error` 値の中に `nil` があれば、それは無視されます。
*   もしすべての引数が `nil` であれば、`errors.Join` は `nil` を返します。
*   `nil` でないエラーが1つ以上あれば、`errors.Join` はそれらのエラーを内部的にラップした新しい `error` 値を返します。
    *   この新しいエラーの `Error()` メソッドを呼び出すと、結合された各エラーの `Error()` メソッドの結果が改行で連結された文字列が返されます。
    *   `errors.Is` や `errors.As` を使うと、結合されたエラーの中に特定のエラー値や型が含まれているかを（ラップを辿って）確認できます。

## コード例: フォームバリデーション

複数のフィールドを持つフォームの入力値を検証し、発生したすべてのバリデーションエラーをまとめて返す例を見てみましょう。

```go title="errors.Join による複数エラーの結合"
package main

import (
	"errors" // errors.Join, errors.Is を使うため
	"fmt"
	"strings"
)

// --- センチネルエラー (例) ---
var ErrValueRequired = errors.New("値が必要です")
var ErrValueTooShort = errors.New("値が短すぎます")

// --- バリデーション関数 ---
func validateName(name string) error {
	if name == "" {
		return fmt.Errorf("名前: %w", ErrValueRequired)
	}
	if len(name) < 3 {
		// %w でラップすることも、しないことも可能
		return fmt.Errorf("名前 '%s': %w", name, ErrValueTooShort)
	}
	return nil
}

func validateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("メールアドレス: %w", ErrValueRequired)
	}
	if !strings.Contains(email, "@") {
		return fmt.Errorf("メールアドレス '%s': 無効な形式です", email)
	}
	return nil
}

// --- 複数のバリデーションを実行し、エラーを結合 ---
func validateForm(name, email string) error {
	// errors.Join に直接バリデーション関数の結果を渡す
	// 各関数が nil を返せば、それは Join によって無視される
	err := errors.Join(
		validateName(name),
		validateEmail(email),
		// 他のバリデーションもここに追加できる
	)
	// すべてのバリデーションが成功 (すべて nil を返した) 場合、err は nil になる
	// 1つ以上のエラーがあれば、err は結合されたエラー値になる
	return err
}

func main() {
	// --- ケース1: すべて有効 ---
	fmt.Println("--- ケース1: すべて有効 ---")
	err1 := validateForm("Gopher", "gopher@example.com")
	if err1 != nil {
		fmt.Printf("エラー: %v\n", err1)
	} else {
		fmt.Println("バリデーション成功")
	}

	// --- ケース2: 名前が短く、メール形式が無効 ---
	fmt.Println("\n--- ケース2: 複数のエラー ---")
	err2 := validateForm("Go", "gopher.example.com")
	if err2 != nil {
		// Error() は結合されたメッセージを表示 (改行区切り)
		fmt.Printf("エラー:\n%v\n", err2)

		// errors.Is で特定のセンチネルエラーが含まれているか確認できる
		if errors.Is(err2, ErrValueTooShort) {
			fmt.Println("-> 値が短すぎるエラーが含まれています。")
		}
		if errors.Is(err2, ErrValueRequired) {
			fmt.Println("-> 必須項目エラーが含まれています。") // メールアドレスのエラーは含まれていない
		}
		// errors.As で特定の型のエラーを取得することも可能 (ここでは使っていない)
	} else {
		fmt.Println("バリデーション成功")
	}

	// --- ケース3: メールアドレスのみ必須エラー ---
	fmt.Println("\n--- ケース3: 1つのエラー ---")
	err3 := validateForm("ValidName", "")
	if err3 != nil {
		fmt.Printf("エラー: %v\n", err3)
		if errors.Is(err3, ErrValueRequired) {
			fmt.Println("-> 必須項目エラーが含まれています。")
		}
	} else {
		fmt.Println("バリデーション成功")
	}
}

/* 実行結果:
--- ケース1: すべて有効 ---
バリデーション成功

--- ケース2: 複数のエラー ---
エラー:
名前 'Go': 値が短すぎます
メールアドレス 'gopher.example.com': 無効な形式です
-> 値が短すぎるエラーが含まれています。

--- ケース3: 1つのエラー ---
エラー: メールアドレス: 値が必要です
-> 必須項目エラーが含まれています。
*/
```

**コード解説:**

*   `validateName` と `validateEmail` は、バリデーションルールに違反した場合に `fmt.Errorf` を使ってエラーを返します。`ErrValueRequired` や `ErrValueTooShort` といったセンチネルエラーを `%w` でラップしています。
*   `validateForm` 関数では、`errors.Join()` に各バリデーション関数の呼び出し結果を直接渡しています。
    *   もし `validateName` と `validateEmail` の両方がエラーを返した場合、`errors.Join` はそれら2つのエラーを内部的にラップした新しいエラー値を返します。
    *   もし片方だけがエラーを返した場合、`errors.Join` はそのエラーだけを（内部的にはラップして）返します。
    *   もし両方とも `nil` を返した場合、`errors.Join` は `nil` を返します。
*   `main` 関数では、`validateForm` から返されたエラー `err2` や `err3` に対して `errors.Is` を使うことで、結合されたエラーの中に特定のセンチネルエラー (`ErrValueTooShort`, `ErrValueRequired`) が含まれているかどうかを正しく判定できています。
*   結合されたエラーの `Error()` メソッドは、含まれる各エラーの `Error()` 結果を改行で連結したものを返します。

`errors.Join` は、複数の独立した処理を行い、それらの処理で発生したエラーをまとめて報告したい場合に非常に便利な関数です。これにより、呼び出し側は単一のエラー値をチェックするだけで、発生したすべての（または特定の種類の）エラーを把握することができます。