---
title: "エラー処理: 構造化エラー (Structured Errors)"
tags: ["error-handling", "error", "struct", "カスタムエラー", "errors.As"]
---

エラーが発生した際、単なるエラーメッセージ文字列だけでなく、エラーに関する**追加情報**（どのフィールドで問題が起きたか、どのような値が原因か、エラーコードなど）をプログラムで扱える形で保持したい場合があります。このような、構造化された情報を持つエラーを**構造化エラー (Structured Error)** と呼びます。

Goでは、**カスタムエラー型**（通常は構造体）を定義することで、構造化エラーを簡単に実装できます。

## 構造化エラーの定義と利点

カスタムエラー型（構造体）のフィールドを使って、エラーに関する様々な情報を格納します。

```go
// 例: バリデーションエラーを表す構造体
type ValidationError struct {
	FieldName string // エラーが発生したフィールド名
	ErrValue  any    // 問題となった値
	Message   string // エラーメッセージ
}

// Error() メソッドを実装して error インターフェースを満たす
func (e *ValidationError) Error() string {
	return fmt.Sprintf("バリデーションエラー (フィールド: %s, 値: %v): %s",
		e.FieldName, e.ErrValue, e.Message)
}
```

**利点:**

*   **詳細な情報:** エラーメッセージだけでなく、エラーコード、フィールド名、問題の値など、プログラムで利用可能な追加情報をエラーと一緒に渡すことができます。
*   **プログラムによる処理:** 呼び出し側は、`errors.As` を使ってエラーが特定の構造化エラー型であるかを確認し、そのフィールドにアクセスして、エラーの種類や詳細情報に基づいた処理（例: ユーザーへのフィードバックのカスタマイズ、特定フィールドのエラーに対する再試行など）を行うことができます。
*   **ログ記録:** 構造化された情報をログに出力することで、エラーの原因調査が容易になります。

## コード例: 入力バリデーション

ユーザー入力のバリデーションを行い、問題があれば `ValidationError` を返す例を見てみましょう。

```go title="構造化エラーの使用例"
package main

import (
	"errors" // errors.As を使うため
	"fmt"
	"strings"
)

// --- 構造化エラー型 ---
type ValidationError struct {
	FieldName string
	ErrValue  any
	Message   string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("バリデーションエラー (フィールド: %s, 値: '%v'): %s",
		e.FieldName, e.ErrValue, e.Message)
}

// --- バリデーションを行う関数 ---
func validateUsername(username string) error {
	if len(username) < 3 {
		// ValidationError を返す
		return &ValidationError{
			FieldName: "username",
			ErrValue:  username,
			Message:   "短すぎます (3文字以上必要)",
		}
	}
	if strings.Contains(username, " ") {
		return &ValidationError{
			FieldName: "username",
			ErrValue:  username,
			Message:   "空白文字を含めることはできません",
		}
	}
	return nil // エラーなし
}

func main() {
	usernames := []string{"gopher", "go", "user name"}

	for _, name := range usernames {
		fmt.Printf("\nユーザー名 '%s' を検証中...\n", name)
		err := validateUsername(name)

		if err != nil {
			fmt.Println("エラー:", err) // Error() メソッドで整形されたメッセージ

			// --- errors.As で構造化エラーの情報にアクセス ---
			var validationErr *ValidationError // 対象の型 (*ValidationError) のポインタ変数
			if errors.As(err, &validationErr) {
				// エラーが ValidationError 型だった場合
				fmt.Println("-> バリデーションエラーです。")
				// フィールドにアクセスして詳細情報を取得
				fmt.Printf("   フィールド: %s\n", validationErr.FieldName)
				fmt.Printf("   問題の値: %v\n", validationErr.ErrValue)
				fmt.Printf("   詳細: %s\n", validationErr.Message)
				// ここでフィールドに応じたエラー表示のカスタマイズなどが可能
			} else {
				fmt.Println("-> その他の種類のエラーです。")
			}
		} else {
			fmt.Println("-> 検証OK")
		}
	}
}

/* 実行結果:
ユーザー名 'gopher' を検証中...
-> 検証OK

ユーザー名 'go' を検証中...
エラー: バリデーションエラー (フィールド: username, 値: 'go'): 短すぎます (3文字以上必要)
-> バリデーションエラーです。
   フィールド: username
   問題の値: go
   詳細: 短すぎます (3文字以上必要)

ユーザー名 'user name' を検証中...
エラー: バリデーションエラー (フィールド: username, 値: 'user name'): 空白文字を含めることはできません
-> バリデーションエラーです。
   フィールド: username
   問題の値: user name
   詳細: 空白文字を含めることはできません
*/
```

**コード解説:**

*   `ValidationError` 構造体は、バリデーションエラーに関する詳細情報（フィールド名、問題の値、メッセージ）を保持します。
*   `validateUsername` 関数は、バリデーションに失敗した場合に、具体的な情報を含む `*ValidationError` を `error` として返します。
*   `main` 関数では、`validateUsername` から返された `err` をまず `!= nil` でチェックします。
*   エラーがある場合、`errors.As(err, &validationErr)` を使って、そのエラーが `*ValidationError` 型であるか（またはそれをラップしているか）を確認します。
*   `errors.As` が `true` を返した場合、`validationErr` 変数に `*ValidationError` の値が設定されるため、`validationErr.FieldName` や `validationErr.Message` のようにフィールドにアクセスして、より詳細なエラーハンドリングやユーザーフィードバックを行うことができます。

構造化エラーは、単なるエラーメッセージ以上の情報を提供することで、プログラムがエラーに対してよりインテリジェントに対応できるようにするための重要なテクニックです。