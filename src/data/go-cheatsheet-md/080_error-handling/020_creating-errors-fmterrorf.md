## タイトル
title: エラー処理: フォーマットされたエラーの作成 `fmt.Errorf`

## タグ
tags: ["error-handling", "error", "fmt", "fmt.Errorf", "エラーラッピング", "%w"]

## コード
```go
package main

import (
	"errors" // errors.Is を使う
	"fmt"
	"os"
)

// ファイルを開く処理をラップし、エラー時に %w を使う関数
func openFileWrapped(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		// %w で元のエラー err をラップする
		return fmt.Errorf("ファイル '%s' オープン失敗: %w", filename, err)
	}
	file.Close()
	return nil
}

func main() {
	err := openFileWrapped("non_existent.txt")
	if err != nil {
		fmt.Println("エラー:", err) // ラップされたメッセージ

		// errors.Is でラップされたエラーを確認できる
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: ファイルが存在しない")
		}
	}
}

```

## 解説
```text
エラーメッセージに動的な情報を含めたり、元のエラー情報を
保持したまま追加情報を付与（エラーラッピング）したい場合は、
**`fmt.Errorf`** 関数が便利です。
`import "fmt"` で利用します。

**基本的な使い方:**
`fmt.Sprintf` と同様に、書式指定文字列と値を使い、
フォーマットされた文字列をエラーメッセージとして持つ
新しい `error` 値を生成します。
`err := fmt.Errorf("処理失敗: ID=%d, reason=%s", id, reason)`

**エラーラッピング: `%w` 動詞 (Go 1.13+)**
下位の関数で発生した元のエラー (`originalErr`) を保持しつつ、
追加情報（コンテキスト）を付与した新しいエラーを作成する機能です。
`fmt.Errorf` の書式指定文字列内で `%w` を使います。

**構文:** `err := fmt.Errorf("追加情報: %w", originalErr)`
*   `%w` は書式指定文字列内に**一つだけ**使用可能。
*   `%w` に対応する引数は `error` インターフェースを満たす値。

コード例の `openFileWrapped` では、`os.Open` がエラーを返した場合、
`fmt.Errorf("... %w", filename, err)` で元のエラー `err` を
ラップしています。

**ラップされたエラーの確認:**
`%w` でラップされたエラーは、`errors.Is` や `errors.As`
(後述) を使って、元の特定のエラーが含まれているかを確認できます。
コード例では `errors.Is(err, os.ErrNotExist)` で、
ラップされたエラー `err` の中に `os.ErrNotExist` が含まれるか
チェックしています。(`%w` でラップしないと `Is` では確認できない)

**推奨:**
下位の関数から返されたエラーに追加情報を付与して返す場合は、
**常に `%w` を使ってエラーをラップする**ことが推奨されます。
これにより、エラーの原因調査や特定エラーに対する処理分岐が容易になります。

`fmt.Errorf` は動的な情報を含めたりエラーをラップできるため、
`errors.New` より一般的に使われます。