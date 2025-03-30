## タイトル
title: 結合されたエラーの検査 (Go 1.20+)

## タグ
tags: ["error-handling", "error", "errors", "errors.Join", "errors.Is", "errors.As", "エラーラッピング", "Go1.20"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"os"
	// "strings" // strings.Split を使う場合
)

// --- エラー定義やエラーを返す関数は省略 (前のセクション参照) ---
var ErrValueRequired = errors.New("値が必要")
var ErrValueTooShort = errors.New("短すぎ")
type ConfigError struct { FileName string; Err error }
func (e *ConfigError) Error() string { return fmt.Sprintf("設定 '%s': %v", e.FileName, e.Err) }
func (e *ConfigError) Unwrap() error { return e.Err }
func validateName(name string) error { if len(name) < 3 { return fmt.Errorf("名前 '%s': %w", name, ErrValueTooShort) }; return nil }
func validateEmail(email string) error { if email == "" { return fmt.Errorf("メール: %w", ErrValueRequired) }; return nil }
func loadConfigFile(filename string) error { _, err := os.Open(filename); if err != nil { return &ConfigError{filename, err} }; return nil }
// --- ここまで省略 ---


func main() {
	// 複数のエラーを結合 (例)
	joinedErr := errors.Join(
		validateName("Go"),             // ErrValueTooShort をラップ
		validateEmail(""),              // ErrValueRequired をラップ
		loadConfigFile("config.txt"), // ConfigError (os.ErrNotExist をラップ)
	)

	if joinedErr != nil {
		fmt.Printf("結合エラー:\n%v\n", joinedErr)

		// errors.Is で特定のエラー値が含まれるか検査
		if errors.Is(joinedErr, ErrValueTooShort) { fmt.Println("-> 短すぎエラーあり") }
		if errors.Is(joinedErr, os.ErrNotExist) { fmt.Println("-> ファイルなしエラーあり") }

		// errors.As で特定の型のエラーが含まれるか検査
		var configErr *ConfigError
		if errors.As(joinedErr, &configErr) {
			fmt.Println("-> ConfigError あり (ファイル:", configErr.FileName, ")")
		}

		// 個々のエラーメッセージ取得 (参考: Error() を分割)
		// for _, line := range strings.Split(joinedErr.Error(), "\n") { ... }
	}
}
```

## 解説
```text
`errors.Join()` で結合されたエラーの中に、どのようなエラーが
含まれているかを検査したい場合があります。

**`errors.Is` と `errors.As` による検査:**
`errors.Join` で結合されたエラーに対しても、
**`errors.Is`** や **`errors.As`** が利用できます。
これらの関数は、結合されたエラーの内部に含まれる
個々のエラー（エラーチェーン）を辿って、指定した
エラー値や型を探してくれます。

*   **`errors.Is(joinedErr, targetErr)`:**
    `joinedErr` 内に `targetErr` と同じエラー値があれば `true`。
*   **`errors.As(joinedErr, &targetVar)`:**
    `joinedErr` 内に `targetVar` の型に代入可能なエラーがあれば
    `true` を返し、`targetVar` にその値を設定。

コード例では、`validateName`, `validateEmail`, `loadConfigFile` が
返す可能性のある複数のエラーを `errors.Join` で結合しています。
その後、`errors.Is` を使って `ErrValueTooShort` や `os.ErrNotExist`
(ラップされている) が含まれるかを確認し、`errors.As` を使って
`*ConfigError` 型のエラーが含まれるかを確認し、そのフィールドに
アクセスしています。

**個々のエラーへのアクセス:**
Go 1.20 時点では、結合された個々のエラー値を直接スライス等で
取得する標準関数はありません。
`joinedErr.Error()` の結果（改行区切りの文字列）を
`strings.Split()` で分割すれば個々のエラーメッセージ文字列は
取得できますが、元のエラー値そのものではありません。

`errors.Join` と `errors.Is`/`errors.As` を組み合わせることで、
複数のエラーをまとめつつ、必要な詳細情報に基づいて
エラーハンドリングを行うことができます。