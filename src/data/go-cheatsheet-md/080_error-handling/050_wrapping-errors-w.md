---
title: "エラー処理: エラーラッピング (`%w`)"
tags: ["error-handling", "error", "fmt.Errorf", "エラーラッピング", "%w", "errors.Is", "errors.As"]
---

Go 1.13 以降では、`fmt.Errorf` 関数で特別なフォーマット動詞 **`%w`** を使うことで、**エラーラッピング (Error Wrapping)** を行うことができます。これは、元のエラー情報を保持したまま、追加のコンテキスト情報を付与した新しいエラーを作成する機能です。

エラーラッピングの基本的な使い方と利点については、**「フォーマットされたエラーの作成 `fmt.Errorf`」** (`080_error-handling/020_creating-errors-fmterrorf.md`) のセクションで既に説明しました。

ここでは、その重要性を再確認します。

## なぜエラーラッピングが重要か？

*   **エラーの原因特定:** `%w` でエラーをラップしておくと、後から `errors.Is` や `errors.As` 関数（後のセクションで説明）を使って、エラーチェーン（ラップされたエラーの連なり）を遡り、根本的なエラーの原因（例: `os.ErrNotExist`）を特定したり、特定のエラー型が持つ情報にアクセスしたりすることが可能になります。
*   **コンテキストの付与:** エラーが発生した状況に関する追加情報（どの操作で、どのファイルで、どのIDで失敗したかなど）を、元のエラーを失うことなく付与できます。

## コード例 (再掲)

```go title="エラーラッピング (%w) の例"
package main

import (
	"errors"
	"fmt"
	"os"
)

// 下位の処理 (例: ファイルオープン)
func openDataFile(filename string) (*os.File, error) {
	f, err := os.Open(filename)
	if err != nil {
		// ここでは元のエラーをそのまま返す
		return nil, err
	}
	return f, nil
}

// 上位の処理 (ファイルを開いて何かする)
func processFile(filename string) error {
	file, err := openDataFile(filename)
	if err != nil {
		// ★ openDataFile から返されたエラー err を %w でラップする
		return fmt.Errorf("ファイル処理失敗 (%s): %w", filename, err)
	}
	defer file.Close()

	// ... ファイルを使った処理 ...
	fmt.Printf("ファイル '%s' を正常に処理しました。\n", filename)
	return nil
}

func main() {
	// 存在しないファイルを処理しようとする
	err := processFile("non_existent.txt")

	if err != nil {
		fmt.Println("エラー:", err) // ラップされたエラーメッセージが表示される

		// errors.Is でラップされた根本原因をチェックできる
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: ファイルが存在しません。")
		}
	}
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
エラー: ファイル処理失敗 (non_existent.txt): open non_existent.txt: no such file or directory
-> 原因: ファイルが存在しません。
*/
```

**推奨:**

関数内で発生したエラーや、呼び出した他の関数から返されたエラーに対して、追加情報（コンテキスト）を加えて呼び出し元に返す場合は、**常に `%w` を使って元のエラーをラップする**ようにしましょう。これにより、エラーの原因調査や、エラーの種類に応じた処理の分岐が格段に行いやすくなります。 `%v` などでエラーメッセージを単に文字列として埋め込んでしまうと、元のエラー情報は失われてしまいます。