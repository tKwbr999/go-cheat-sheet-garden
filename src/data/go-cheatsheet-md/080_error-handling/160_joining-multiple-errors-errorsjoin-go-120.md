## タイトル
title: 複数のエラーの結合 `errors.Join` (Go 1.20+)

## タグ
tags: ["error-handling", "error", "errors", "errors.Join", "エラーラッピング", "Go1.20"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"strings"
)

var ErrValueRequired = errors.New("値が必要")
var ErrValueTooShort = errors.New("短すぎ")

func validateName(name string) error {
	if name == "" { return fmt.Errorf("名前: %w", ErrValueRequired) }
	if len(name) < 3 { return fmt.Errorf("名前 '%s': %w", name, ErrValueTooShort) }
	return nil
}
func validateEmail(email string) error {
	if email == "" { return fmt.Errorf("メール: %w", ErrValueRequired) }
	if !strings.Contains(email, "@") { return fmt.Errorf("メール '%s': 無効", email) }
	return nil
}

// 複数のバリデーションを行い、エラーを errors.Join で結合
func validateForm(name, email string) error {
	// 各バリデーション結果 (error または nil) を Join に渡す
	return errors.Join(
		validateName(name),
		validateEmail(email),
	) // nil は無視され、エラーがあれば結合される
}

func main() {
	// 複数のエラーが発生するケース
	err := validateForm("Go", "invalid-email")
	if err != nil {
		// Error() は結合されたメッセージを改行区切りで返す
		fmt.Printf("エラー:\n%v\n", err)

		// errors.Is で特定のエラーが含まれるか確認できる
		if errors.Is(err, ErrValueTooShort) {
			fmt.Println("-> 短すぎるエラーあり")
		}
		if errors.Is(err, ErrValueRequired) {
			fmt.Println("-> 必須エラーあり") // これは含まれない
		}
	}
}
```

## 解説
```text
Go 1.20 から `errors` パッケージに **`Join`** 関数が追加されました。
これは**複数の `error` 値を一つにまとめて**単一の `error` 値として
扱うための関数です。`import "errors"` で利用します。

**使い方:**
`errors.Join` は任意の数の `error` 値を引数に取ります。
**構文:** `err := errors.Join(err1, err2, ..., errN)`

*   引数中の `nil` は無視されます。
*   すべての引数が `nil` なら `nil` を返します。
*   `nil` でないエラーが1つ以上あれば、それらを内部的に
    ラップした新しい `error` 値を返します。

**結合されたエラーの特性:**
*   `Error()` 含まれる各エラーの `Error()` 結果を
    改行で連結した文字列を返します。
*   `errors.Is` / `errors.As`: 結合されたエラーの中に
    特定のエラー値や型が含まれているかを (ラップを辿って)
    確認できます。

コード例の `validateForm` 関数では、`validateName` と
`validateEmail` の結果を `errors.Join` に渡しています。
両方がエラーを返した場合、`err` は両方のエラーを結合したものになります。
`main` 関数では、結合された `err` に対して `errors.Is` を使い、
`ErrValueTooShort` が含まれていることを確認できています。

`errors.Join` は、複数の独立した処理を行い、それらのエラーを
まとめて報告したい場合に非常に便利です。呼び出し側は単一の
エラー値をチェックするだけで、発生したエラーを把握できます。