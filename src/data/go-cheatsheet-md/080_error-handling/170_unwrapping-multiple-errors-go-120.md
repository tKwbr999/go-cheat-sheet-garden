---
title: "エラー処理: 結合されたエラーの検査 (Go 1.20+)"
tags: ["error-handling", "error", "errors", "errors.Join", "errors.Is", "errors.As", "エラーラッピング", "Go1.20"]
---

`errors.Join()` 関数を使うと複数のエラーを一つにまとめることができますが、呼び出し側では、その結合されたエラーの中にどのようなエラーが含まれているかを検査したい場合があります。

## `errors.Is` と `errors.As` による検査

`errors.Join` で結合されたエラーに対しても、**`errors.Is`** や **`errors.As`** を使うことができます。これらの関数は、結合されたエラーの内部に含まれる個々のエラー（エラーチェーン）を辿って、指定したエラー値や型を探してくれます。

*   **`errors.Is(joinedErr, targetErr)`:** `joinedErr` の中に `targetErr` と同じエラー値が含まれていれば `true` を返します。
*   **`errors.As(joinedErr, &targetVar)`:** `joinedErr` の中に `targetVar` の型に代入可能なエラーがあれば `true` を返し、`targetVar` にそのエラー値を設定します。最初に見つかったものが設定されます。

## 個々のエラーへのアクセス (Go 1.20 時点)

Go 1.20 の時点では、`errors.Join` で結合された個々のエラーを直接スライスなどとして取得するための標準的な関数（例えば `errors.Unwrap` の複数版のようなもの）は提供されていません。

ただし、`errors.Join` が返すエラーの `Error()` メソッドは、結合された各エラーの `Error()` 結果を改行 (`\n`) で連結した文字列を返す仕様になっています。これを利用して、個々のエラーメッセージ文字列を取得することは可能です（ただし、これはあくまで文字列操作であり、元のエラー値そのものを取得するわけではありません）。

## コード例

```go title="結合されたエラーの検査"
package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

// --- エラー定義 (再掲) ---
var ErrValueRequired = errors.New("値が必要です")
var ErrValueTooShort = errors.New("値が短すぎます")

type ConfigError struct {
	FileName string
	Err      error
}

func (e *ConfigError) Error() string { return fmt.Sprintf("設定 '%s' 処理エラー: %v", e.FileName, e.Err) }
func (e *ConfigError) Unwrap() error { return e.Err }

// --- エラーを返す関数 (再掲) ---
func validateName(name string) error {
	if name == "" { return fmt.Errorf("名前: %w", ErrValueRequired) }
	if len(name) < 3 { return fmt.Errorf("名前 '%s': %w", name, ErrValueTooShort) }
	return nil
}
func validateEmail(email string) error {
	if email == "" { return fmt.Errorf("メール: %w", ErrValueRequired) }
	if !strings.Contains(email, "@") { return fmt.Errorf("メール '%s': 無効な形式", email) }
	return nil
}
func loadConfigFile(filename string) error {
	// 存在しないファイルを指定してエラーを発生させる
	_, err := os.Open(filename)
	if err != nil {
		// os.Open のエラーを ConfigError でラップ
		return &ConfigError{FileName: filename, Err: err}
	}
	return nil
}

func main() {
	// 複数の種類のエラーを結合
	joinedErr := errors.Join(
		validateName("Go"),             // ErrValueTooShort をラップしたエラー
		validateEmail(""),              // ErrValueRequired をラップしたエラー
		loadConfigFile("config.txt"), // ConfigError (os.ErrNotExist をラップ)
	)

	if joinedErr != nil {
		fmt.Println("--- 結合されたエラー ---")
		fmt.Printf("Error():\n%v\n", joinedErr)

		fmt.Println("\n--- errors.Is での検査 ---")
		// 結合されたエラーの中に ErrValueTooShort が含まれているか？
		if errors.Is(joinedErr, ErrValueTooShort) {
			fmt.Println("-> ErrValueTooShort が含まれています。")
		}
		// 結合されたエラーの中に ErrValueRequired が含まれているか？
		if errors.Is(joinedErr, ErrValueRequired) {
			fmt.Println("-> ErrValueRequired が含まれています。")
		}
		// 結合されたエラーの中に os.ErrNotExist が含まれているか？ (ラップされている)
		if errors.Is(joinedErr, os.ErrNotExist) {
			fmt.Println("-> os.ErrNotExist が含まれています。")
		}

		fmt.Println("\n--- errors.As での検査 ---")
		// 結合されたエラーの中に *ConfigError 型のエラーが含まれているか？
		var configErr *ConfigError
		if errors.As(joinedErr, &configErr) {
			// 見つかった場合、configErr にその値が設定される
			fmt.Println("-> *ConfigError が含まれています。")
			fmt.Printf("   ファイル名: %s\n", configErr.FileName)
			// さらにラップされたエラーも確認できる
			if configErr.Err != nil {
				fmt.Printf("   ラップされたエラー: %v\n", configErr.Err)
			}
		} else {
			fmt.Println("-> *ConfigError は含まれていません。")
		}

		// --- 個々のエラーメッセージの取得 (参考) ---
		fmt.Println("\n--- 個々のエラーメッセージ (Error() を分割) ---")
		// Error() の結果を改行で分割して表示
		for _, line := range strings.Split(joinedErr.Error(), "\n") {
			fmt.Printf("  - %s\n", line)
		}
	}
}

/* 実行結果 (エラーメッセージの細部は環境による):
--- 結合されたエラー ---
Error():
名前 'Go': 値が短すぎます
メール: 値が必要です
設定 'config.txt' 処理エラー: open config.txt: no such file or directory

--- errors.Is での検査 ---
-> ErrValueTooShort が含まれています。
-> ErrValueRequired が含まれています。
-> os.ErrNotExist が含まれています。

--- errors.As での検査 ---
-> *ConfigError が含まれています。
   ファイル名: config.txt
   ラップされたエラー: open config.txt: no such file or directory

--- 個々のエラーメッセージ (Error() を分割) ---
  - 名前 'Go': 値が短すぎます
  - メール: 値が必要です
  - 設定 'config.txt' 処理エラー: open config.txt: no such file or directory
*/
```

**コード解説:**

*   `joinedErr` には、`validateName`, `validateEmail`, `loadConfigFile` から返された3つのエラー（または `nil`）が `errors.Join` によって結合されています。
*   `errors.Is(joinedErr, ErrValueTooShort)` や `errors.Is(joinedErr, ErrValueRequired)` は `true` を返します。これは `errors.Join` が内部のエラーチェーンを正しく辿ってくれるためです。`os.ErrNotExist` も `ConfigError` を経由してラップされているため、`errors.Is` で検出できます。
*   `errors.As(joinedErr, &configErr)` も `true` を返し、`configErr` 変数に `joinedErr` 内に含まれる `*ConfigError` の値が設定されます。これにより、`configErr.FileName` のようなフィールドにアクセスできます。
*   `strings.Split(joinedErr.Error(), "\n")` は、結合されたエラーの文字列表現を改行で分割し、個々のエラーメッセージ（の文字列）を取得する一つの方法を示しています。

`errors.Join` でエラーを結合しても、`errors.Is` と `errors.As` を使えば、元のエラー情報に基づいて適切にエラーハンドリングを行うことができます。