## タイトル
title: エラーラッピング (`%w`)

## タグ
tags: ["error-handling", "error", "fmt.Errorf", "エラーラッピング", "%w", "errors.Is", "errors.As"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"os"
)

// 下位の処理 (エラーを返す可能性)
func openDataFile(filename string) (*os.File, error) {
	return os.Open(filename) // 元のエラーを返す
}

// 上位の処理 (エラーをラップする)
func processFile(filename string) error {
	file, err := openDataFile(filename)
	if err != nil {
		// ★ %w で元のエラー err をラップする
		return fmt.Errorf("ファイル処理失敗 (%s): %w", filename, err)
	}
	defer file.Close()
	fmt.Printf("ファイル '%s' 処理成功\n", filename)
	return nil
}

func main() {
	err := processFile("non_existent.txt")
	if err != nil {
		fmt.Println("エラー:", err) // ラップされたメッセージ

		// errors.Is でラップされた根本原因をチェック
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: ファイルが存在しない")
		}
	}
}

```

## 解説
```text
Go 1.13 以降、`fmt.Errorf` で特別なフォーマット動詞 **`%w`** を使い
**エラーラッピング (Error Wrapping)** ができます。
これは元のエラー情報を保持しつつ、追加コンテキスト情報を付与する機能です。

**なぜ重要か？**
*   **原因特定:** `%w` でラップすると、後から `errors.Is` や `errors.As`
    (後述) でエラーチェーンを遡り、根本原因 (例: `os.ErrNotExist`) を
    特定したり、特定のエラー型の情報にアクセスできる。
*   **コンテキスト付与:** どの操作で、どのファイルで失敗したか等の
    追加情報を、元のエラーを失わずに付与できる。

**使い方:**
`err := fmt.Errorf("追加情報: %w", originalErr)`
*   `%w` は書式指定文字列内に**一つだけ**。
*   対応する引数は `error` インターフェースを満たす値。

コード例の `processFile` では、`openDataFile` から返ったエラー `err` を
`fmt.Errorf("... %w", filename, err)` でラップしています。
`main` では、ラップされたエラー `err` に対し `errors.Is` を使い、
根本原因が `os.ErrNotExist` かどうかをチェックできています。
(`%w` でラップしないと `errors.Is` では通常チェックできない)

**推奨:**
下位関数から返されたエラーに追加情報を加えて返す場合は、
**常に `%w` を使って元のエラーをラップしましょう**。
これによりエラーの原因調査や種類に応じた処理分岐が容易になります。
(`%v` などでメッセージを埋め込むと元のエラー情報は失われる)