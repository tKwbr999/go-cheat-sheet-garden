---
title: "エラー処理: ラップされたエラーの判定 (`errors.Is`)"
tags: ["error-handling", "error", "errors", "errors.Is", "エラーラッピング", "%w", "センチネルエラー"]
---

エラーラッピング (`fmt.Errorf` の `%w`) を使う主な利点の一つは、エラーの連鎖（チェーン）を辿って、根本的な原因となった特定のエラー値（センチネルエラーなど）が含まれているかどうかを後から確認できることです。この確認のために **`errors.Is()`** 関数を使います。

`errors.Is()` の基本的な使い方については、**「エラーは値 (`errors.Is`)」** (`080_error-handling/060_errors-as-values-errorsis.md`) のセクションを参照してください。

ここでは、エラーラッピングと `errors.Is` の組み合わせを改めて確認します。

## `%w` と `errors.Is` の連携

`fmt.Errorf` で `%w` を使ってエラーをラップすると、`errors.Is(err, target)` は `err` 自体が `target` と同じか、または `err` がラップしているエラーのいずれかが `target` と同じであれば `true` を返します。

```go title="ラップされたエラーに対する errors.Is の使用"
package main

import (
	"errors"
	"fmt"
	"os" // os.ErrNotExist を使うため
)

// --- センチネルエラー ---
var ErrConfigNotFound = errors.New("設定ファイルが見つかりません")

// --- エラーをラップする可能性のある関数 ---
func loadConfig(path string) error {
	// ファイルを開く試み (os.Open は失敗すると os.ErrNotExist を含むエラーを返す)
	_, err := os.Open(path)
	if err != nil {
		// os.Open のエラーをラップして返す
		return fmt.Errorf("設定ファイル '%s' の読み込みに失敗: %w", path, err)
	}
	// ... 実際にはファイルの内容を読み込む処理 ...
	// file.Close()
	return nil
}

func setup(configPath string) error {
	err := loadConfig(configPath)
	if err != nil {
		// loadConfig からのエラーをさらにラップする
		return fmt.Errorf("初期設定に失敗: %w", err)
	}
	// ... 設定を使った初期化処理 ...
	return nil
}

func main() {
	// 存在しない設定ファイルを指定して setup を呼び出す
	err := setup("config.yaml")

	if err != nil {
		fmt.Println("エラー発生:", err) // 最も外側のエラーメッセージが表示される

		// --- errors.Is で根本原因を探る ---

		// エラーチェーンの中に os.ErrNotExist が含まれているか？
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: 設定ファイルが存在しませんでした。デフォルト設定を使用します。")
			// ここでデフォルト設定を使うなどの代替処理を行う
		} else if errors.Is(err, ErrConfigNotFound) { // 別のセンチネルエラーもチェック可能
			fmt.Println("-> 原因: 設定ファイルが見つからないというカスタムエラーです。")
		} else {
			fmt.Println("-> その他の予期せぬエラーです。")
		}

		// --- 比較: == ではラップされたエラーは判定できない ---
		// if err == os.ErrNotExist { ... } // これは false になる
	} else {
		fmt.Println("設定は正常に完了しました。")
	}
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
エラー発生: 初期設定に失敗: 設定ファイル 'config.yaml' の読み込みに失敗: open config.yaml: no such file or directory
-> 原因: 設定ファイルが存在しませんでした。デフォルト設定を使用します。
*/
```

**コード解説:**

*   `loadConfig` 関数は `os.Open` のエラーを `%w` を使ってラップします。
*   `setup` 関数は `loadConfig` から返されたエラーをさらに `%w` を使ってラップします。
*   `main` 関数で受け取る `err` は、`setup` -> `loadConfig` -> `os.Open` というエラーの連鎖（チェーン）を持っています。
*   `errors.Is(err, os.ErrNotExist)` は、このエラーチェーンを遡り、根本原因である `os.ErrNotExist` を見つけ出すことができるため、`true` を返します。
*   もし `%w` を使わずに `%v` などでエラーメッセージを単に連結していた場合、`errors.Is` は `os.ErrNotExist` を見つけられず `false` を返します。

エラーをラップすることと `errors.Is` を使うことはセットであり、Go 1.13 以降の推奨されるエラーハンドリングの重要な部分です。これにより、エラーのコンテキストを追加しつつ、根本的な原因に基づいた処理の分岐が可能になります。