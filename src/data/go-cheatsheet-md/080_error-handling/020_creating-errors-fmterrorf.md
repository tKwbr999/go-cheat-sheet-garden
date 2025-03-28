---
title: "エラー処理: フォーマットされたエラーの作成 `fmt.Errorf`"
tags: ["error-handling", "error", "fmt", "fmt.Errorf", "エラーラッピング", "%w"]
---

`errors.New` は固定の文字列からエラーを作成するのに便利ですが、エラーメッセージに**動的な情報**（変数の値、発生箇所など）を含めたい場合や、**元のエラー情報**を保持したまま追加情報を付与したい（エラーラッピング）場合があります。このような場合に、標準ライブラリの **`fmt`** パッケージにある **`Errorf`** 関数がよく使われます。

`import "fmt"` として利用します。

## `fmt.Errorf()` の使い方

`fmt.Errorf()` 関数は、`fmt.Sprintf` と同じように、**書式指定文字列 (format string)** とそれに埋め込む値を受け取り、フォーマットされた文字列をエラーメッセージとして持つ新しい `error` 型の値を生成して返します。

**構文:** `err := fmt.Errorf("フォーマット文字列 %v %d", 値1, 値2)`

*   第一引数に、`%s`, `%d`, `%v` などのフォーマット動詞を含む書式指定文字列を渡します。
*   第二引数以降に、フォーマット動詞に対応する値を渡します。
*   戻り値 `err` は `error` インターフェースを満たす値です。
*   `err.Error()` を呼び出すと、フォーマットされたエラーメッセージ文字列が返されます。

```go title="fmt.Errorf の基本的な使い方"
package main

import (
	"fmt"
	"os" // ファイル操作の例のため
)

// ファイルを開いてサイズを取得する関数 (エラーを返す可能性あり)
func getFileSize(filename string) (int64, error) {
	file, err := os.Open(filename)
	if err != nil {
		// ★ fmt.Errorf で動的な情報 (filename) を含むエラーメッセージを作成
		return 0, fmt.Errorf("ファイル '%s' を開けません", filename)
	}
	defer file.Close()

	stat, err := file.Stat() // ファイル情報を取得
	if err != nil {
		// ★ fmt.Errorf でエラーメッセージを作成
		return 0, fmt.Errorf("ファイル '%s' の情報を取得できません", filename)
	}

	// 成功時はサイズと nil を返す
	return stat.Size(), nil
}

func main() {
	// --- 成功する例 ---
	// (事前に "my_data.txt" を作成しておく)
	os.WriteFile("my_data.txt", []byte("some data"), 0644)

	size1, err1 := getFileSize("my_data.txt")
	if err1 != nil {
		fmt.Println("エラー1:", err1)
	} else {
		fmt.Printf("ファイルサイズ1: %d バイト\n", size1)
	}

	// --- 失敗する例 (ファイルが存在しない) ---
	size2, err2 := getFileSize("non_existent.txt")
	if err2 != nil {
		// fmt.Errorf で生成されたエラーメッセージが表示される
		fmt.Println("エラー2:", err2)
	} else {
		fmt.Printf("ファイルサイズ2: %d バイト\n", size2)
	}

	// 後片付け
	os.Remove("my_data.txt")
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
ファイルサイズ1: 9 バイト
エラー2: ファイル 'non_existent.txt' を開けません
*/
```

## エラーラッピング: `%w` 動詞 (Go 1.13+)

Go 1.13 から、`fmt.Errorf` に **`%w`** という特別なフォーマット動詞が追加されました。これは**エラーラッピング (Error Wrapping)** を行うためのものです。

エラーラッピングとは、ある関数で発生した元のエラー (`originalErr`) を保持したまま、そのエラーに関する追加情報（コンテキスト）を付与した新しいエラーを作成するテクニックです。

`%w` を使ってエラーをラップすると、後から `errors.Is` や `errors.As` といった関数（後のセクションで説明）を使って、ラップされた元のエラーが特定のエラーであるかを確認したり、元のエラーが持つ情報にアクセスしたりすることが可能になります。

**構文:** `err := fmt.Errorf("追加情報: %w", originalErr)`

*   `%w` は書式指定文字列の中に**一つだけ**含めることができます。
*   `%w` に対応する引数は `error` インターフェースを満たす値である必要があります。

```go title="fmt.Errorf と %w によるエラーラッピング"
package main

import (
	"errors" // errors.Is を使うため
	"fmt"
	"os"
)

// ファイルを開く処理をラップする関数
func openFileWrapped(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		// ★ os.Open から返された元のエラー err を %w でラップする
		// これにより、呼び出し元は元の os エラーに関する情報も保持できる
		return fmt.Errorf("ファイル '%s' のオープンに失敗しました: %w", filename, err)
	}
	// 簡単のため、すぐに閉じる
	file.Close()
	return nil
}

func main() {
	err := openFileWrapped("non_existent.txt")

	if err != nil {
		fmt.Println("エラー発生:", err) // ラップされたエラーメッセージが表示される

		// errors.Is を使って、ラップされたエラーの中に
		// 特定のエラー (os.ErrNotExist) が含まれているかを確認できる
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("-> 原因: ファイルが存在しませんでした。")
		}
	}
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
エラー発生: ファイル 'non_existent.txt' のオープンに失敗しました: open non_existent.txt: no such file or directory
-> 原因: ファイルが存在しませんでした。
*/
```

**コード解説:**

*   `openFileWrapped` 関数内で `os.Open` が失敗した場合、`fmt.Errorf("... %w", filename, err)` を使ってエラーを返しています。`%w` によって、`os.Open` が返した元のエラー `err` が新しいエラーの中に「ラップ」されます。
*   `main` 関数では、`openFileWrapped` から返されたエラー `err` を受け取ります。
*   `errors.Is(err, os.ErrNotExist)` を使うと、`err` がラップしているエラーチェーンの中に `os.ErrNotExist`（ファイルが存在しないことを示す標準エラー）が含まれているかどうかを確認できます。`%w` でラップしていなければ、この確認はできません。

**推奨:**

下位の関数から返されたエラーに追加のコンテキスト情報を付与して、さらに上位の関数にエラーを返す場合は、**常に `%w` を使ってエラーをラップする**ことが推奨されます。これにより、エラーの原因調査や、特定のエラーに対する処理の分岐が容易になります。

`fmt.Errorf` は、動的な情報を含んだり、エラーをラップしたりできるため、`errors.New` よりも一般的に使われることが多いエラー作成方法です。