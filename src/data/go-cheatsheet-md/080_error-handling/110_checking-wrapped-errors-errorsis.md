## タイトル
title: エラー処理: ラップされたエラーの判定 (`errors.Is`)

## タグ
tags: ["error-handling", "error", "errors", "errors.Is", "エラーラッピング", "%w", "センチネルエラー"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"os"
)

// 下位の処理 (os.Open のエラーをラップ)
func loadConfig(path string) error {
	_, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("設定読込失敗 '%s': %w", path, err) // %w でラップ
	}
	return nil
}

// 上位の処理 (loadConfig のエラーをさらにラップ)
func setup(configPath string) error {
	err := loadConfig(configPath)
	if err != nil {
		return fmt.Errorf("初期設定失敗: %w", err) // %w でラップ
	}
	return nil
}

func main() {
	err := setup("config.yaml") // 存在しないファイル
	if err != nil {
		fmt.Println("エラー:", err)

		// errors.Is でラップされた根本原因 (os.ErrNotExist) をチェック
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: 設定ファイルが存在しない")
		} else {
			fmt.Println("-> その他のエラー")
		}

		// if err == os.ErrNotExist { ... } // これは false になる
	}
}

```

## 解説
```text
エラーラッピング (`fmt.Errorf` の `%w`) の主な利点は、
エラーチェーンを辿って根本原因となった特定のエラー値
(センチネルエラー等) が含まれるかを確認できることです。
この確認には **`errors.Is()`** を使います。

**`%w` と `errors.Is` の連携:**
`fmt.Errorf` で `%w` を使ってエラー `originalErr` をラップすると、
`errors.Is(wrappedErr, targetErr)` は、
`wrappedErr` 自体、またはそれがラップしているエラーのいずれかが
`targetErr` と同じであれば `true` を返します。

コード例:
1. `loadConfig` は `os.Open` のエラーを `%w` でラップします。
2. `setup` は `loadConfig` のエラーをさらに `%w` でラップします。
3. `main` で受け取る `err` は二重にラップされたエラーです。
4. `errors.Is(err, os.ErrNotExist)` はエラーチェーンを遡り、
   根本原因の `os.ErrNotExist` を見つけて `true` を返します。

もし `%w` でなく `%v` などでエラーメッセージを連結していた場合、
元のエラー情報は失われ、`errors.Is` は `false` を返します。

エラーをラップすることと `errors.Is` を使うことはセットであり、
Go 1.13 以降の推奨されるエラーハンドリングの重要な部分です。
これにより、エラーのコンテキストを追加しつつ、
根本原因に基づいた処理分岐が可能になります。