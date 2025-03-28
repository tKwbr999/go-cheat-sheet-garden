---
title: "関数: エラーを返す (`error` 型)"
tags: ["functions", "func", "戻り値", "return", "エラー処理", "error", "nil", "errors", "fmt.Errorf"]
---

Go言語では、他の多くの言語のような例外 (`try-catch`) の仕組みは**ありません**。代わりに、エラーが発生する可能性のある関数は、**通常の戻り値と一緒に `error` 型の値を返す**ことで、エラーが発生したことを呼び出し元に伝えます。これはGoの非常に重要な設計思想であり、「エラーは値である (Errors are values)」という考え方に基づいています。

## `error` 型とは？

`error` はGoの組み込みインターフェース型で、以下のように定義されています。

```go
type error interface {
    Error() string
}
```

つまり、`Error() string` というメソッドを持つ任意の型は、`error` インターフェースを満たします。この `Error()` メソッドは、人間が読める形式のエラーメッセージ文字列を返すことが期待されます。

関数が成功した場合は `error` 型の戻り値として **`nil`** を返し、失敗した場合は `nil` でない `error` 値（エラーの詳細情報を持つ）を返します。

## エラーの生成

`error` 型の値を作成するには、主に以下の方法があります。

*   **`errors.New(message string) error`**: 標準ライブラリの `errors` パッケージにある関数で、単純なエラーメッセージ文字列から `error` 値を作成します。
*   **`fmt.Errorf(format string, a ...any) error`**: 標準ライブラリの `fmt` パッケージにある関数で、`Sprintf` と同様に書式指定文字列を使って、より詳細な情報を含むエラーメッセージを持つ `error` 値を作成します。`%w` 動詞を使うとエラーのラップも可能です（エラー処理のセクションで詳述）。

## `(結果, error)` パターン

関数が何らかの結果を返し、かつエラーが発生する可能性がある場合、一般的に**最後の戻り値として `error` 型を指定**します。

**構文:**
```go
func 関数名(引数リスト) (結果の型, error) {
	// ... 処理 ...
	if 成功した場合 {
		return 結果の値, nil // 成功時は結果と nil を返す
	} else {
		// 失敗時は結果の型のゼロ値と、エラー情報を返す
		return 結果のゼロ値, errors.New("エラーメッセージ") // または fmt.Errorf(...)
	}
}
```

## コード例: ファイル読み込み

ファイルを読み込み、その内容をバイトスライス (`[]byte`) として返す関数の例です。ファイルが存在しない、読み取り権限がないなどの理由で失敗する可能性があります。

```go title="エラーを返す関数の例"
package main

import (
	"fmt"
	"io"   // io.ReadAll を使うため
	"os"   // os.Open, file.Close を使うため
)

// 指定されたパスのファイルを読み込み、内容 ([]byte) とエラー (error) を返す
func readFileContent(path string) ([]byte, error) {
	fmt.Printf("ファイル '%s' を開いています...\n", path)
	file, err := os.Open(path) // ファイルを開く (エラーの可能性あり)
	if err != nil {
		// ★ ファイルオープン失敗時: nil とエラーを返す
		// nil は []byte 型のゼロ値
		return nil, fmt.Errorf("ファイル '%s' を開けません: %w", path, err)
	}
	// ★ ファイルを開いたら、必ず閉じるように defer を設定
	defer file.Close()
	fmt.Printf("ファイル '%s' を defer で閉じます。\n", path)

	fmt.Printf("ファイル '%s' の内容を読み込んでいます...\n", path)
	data, err := io.ReadAll(file) // ファイルの内容をすべて読み込む (エラーの可能性あり)
	if err != nil {
		// ★ 読み込み失敗時: nil とエラーを返す
		return nil, fmt.Errorf("ファイル '%s' の読み込みに失敗しました: %w", path, err)
	}

	// ★ 成功時: 読み込んだデータと nil (エラーなし) を返す
	fmt.Printf("ファイル '%s' の読み込み成功。\n", path)
	return data, nil
}

func main() {
	// --- 成功する例 ---
	// (事前に "my_config.txt" という名前で適当な内容のファイルを作成しておく)
	os.WriteFile("my_config.txt", []byte("設定内容です。"), 0644) // テスト用ファイル作成

	fmt.Println("--- 成功例 ---")
	content1, err1 := readFileContent("my_config.txt")
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Printf("読み込み成功:\n%s\n", string(content1)) // []byte を string に変換して表示
	}

	// --- 失敗する例 (ファイルが存在しない) ---
	fmt.Println("\n--- 失敗例 ---")
	_, err2 := readFileContent("non_existent_file.txt") // 存在しないファイル
	if err2 != nil {
		// 呼び出し元でエラーを適切に処理
		fmt.Println("エラー:", err2)
	} else {
		fmt.Println("読み込み成功？ (ありえない)")
	}

	// 後片付け
	os.Remove("my_config.txt")
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
--- 成功例 ---
ファイル 'my_config.txt' を開いています...
ファイル 'my_config.txt' を defer で閉じます。
ファイル 'my_config.txt' の内容を読み込んでいます...
ファイル 'my_config.txt' の読み込み成功。
読み込み成功:
設定内容です。

--- 失敗例 ---
ファイル 'non_existent_file.txt' を開いています...
エラー: ファイル 'non_existent_file.txt' を開けません: open non_existent_file.txt: no such file or directory
*/
```

**コード解説:**

*   `readFileContent` 関数は `([]byte, error)` という2つの戻り値を持ちます。
*   `os.Open` や `io.ReadAll` がエラーを返した場合 (`err != nil`)、`readFileContent` は結果として `nil` (バイトスライスのゼロ値) と受け取ったエラー（またはそれをラップした新しいエラー）を `return` します（早期リターン）。
*   すべての処理が成功した場合、最後に読み込んだデータ `data` と `nil` (エラーなし) を `return` します。
*   `main` 関数（呼び出し側）では、`readFileContent` を呼び出した後、必ず `err1` や `err2` が `nil` かどうかをチェックし、エラーに応じた処理を行っています。

この `(結果, error)` を返し、呼び出し側で `if err != nil` をチェックするパターンは、Goにおけるエラー処理の基本であり、非常に重要です。