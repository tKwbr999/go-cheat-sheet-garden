## タイトル
title: 構造化エラー (Structured Errors)

## タグ
tags: ["error-handling", "error", "struct", "カスタムエラー", "errors.As"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"strings"
)

// 構造化エラー型 (例: バリデーションエラー)
type ValidationError struct {
	FieldName string; ErrValue any; Message string
}
func (e *ValidationError) Error() string {
	return fmt.Sprintf("Validation Error (Field: %s, Value: '%v'): %s",
		e.FieldName, e.ErrValue, e.Message)
}

// バリデーション関数 (構造化エラーを返す)
func validateUsername(username string) error {
	if len(username) < 3 {
		return &ValidationError{"username", username, "短すぎ"}
	}
	if strings.Contains(username, " ") {
		return &ValidationError{"username", username, "空白不可"}
	}
	return nil
}

func main() {
	names := []string{"gopher", "go", "user name"}
	for _, name := range names {
		fmt.Printf("\n検証 '%s':\n", name)
		err := validateUsername(name)
		if err != nil {
			fmt.Println(" エラー:", err)
			// errors.As で ValidationError 型かチェック
			var valErr *ValidationError
			if errors.As(err, &valErr) {
				// 型が一致すればフィールドにアクセスできる
				fmt.Printf("  -> Field: %s, Detail: %s\n", valErr.FieldName, valErr.Message)
			}
		} else {
			fmt.Println(" -> OK")
		}
	}
}

```

## 解説
```text
エラーメッセージ文字列だけでなく、エラーに関する**追加情報**
(エラーコード、発生箇所、関連データ等) をプログラムで扱える形で
保持したい場合、**構造化エラー (Structured Error)** を使います。

Goでは**カスタムエラー型**（通常は構造体）を定義することで実装します。

**定義と利点:**
1. エラー情報を保持するフィールドを持つ**構造体**を定義。
2. その構造体に **`Error() string` メソッドを実装**し、
   `error` インターフェースを満たす。
   `Error()` メソッド内でフィールドを使いメッセージを生成。

```go
// 例
type ValidationError struct {
    FieldName string
    ErrValue  any
    Message   string
}
func (e *ValidationError) Error() string { /* ... */ }
```

**利点:**
*   **詳細な情報:** エラーコード、フィールド名、問題の値など、
    構造化された情報をエラーと一緒に渡せる。
*   **プログラムによる処理:** 呼び出し側は `errors.As` で
    エラーが特定の構造化エラー型かを確認し、フィールドに
    アクセスして詳細情報に基づいた処理 (UI表示の調整等) が可能。
*   **ログ記録:** 構造化情報をログに出力し、原因調査を容易にする。

コード例では `ValidationError` を定義し、`validateUsername` 関数が
バリデーション失敗時にそのポインタを `error` として返します。
`main` 関数では `errors.As(err, &valErr)` を使い、エラーが
`*ValidationError` 型かを確認し、そうであれば `valErr.FieldName` 等の
フィールドにアクセスして詳細情報を表示しています。

構造化エラーは、エラーに対してよりインテリジェントに対応するための
重要なテクニックです。