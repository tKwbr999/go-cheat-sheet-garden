---
title: "I/O 操作: 複数の Reader の連結 (`io.MultiReader`)"
tags: ["io-operations", "io", "MultiReader", "Reader", "連結", "ストリーム"]
---

複数の `io.Reader`（例えば、複数のファイルや文字列リーダーなど）があり、それらをあたかも**一つの連続したデータソース**のように扱いたい場合があります。このような場合に便利なのが `io` パッケージの **`MultiReader`** 関数です。

`import "io"` として利用します。

## `io.MultiReader()` の使い方

`io.MultiReader()` は、引数として**任意の数の `io.Reader`**（可変長引数）を受け取り、それらを順番に連結した単一の `io.Reader` を返します。

**構文:** `r := io.MultiReader(r1, r2, ..., rN Reader)`

*   `r1, r2, ..., rN`: 連結したい `io.Reader` を順番に指定します。
*   戻り値 `r`: 新しく作成された `io.Reader`。この `r` から `Read` を呼び出すと、まず `r1` からデータが読み込まれます。`r1` が `io.EOF` を返すと、次に `r2` からデータが読み込まれ、... というように、すべての Reader が EOF を返すまで続きます。最後の Reader が EOF を返すと、`MultiReader` も `io.EOF` を返します。

## コード例

複数の `strings.Reader` を連結して、`io.Copy` で標準出力にコピーする例です。

```go title="io.MultiReader の使用例"
package main

import (
	"fmt"
	"io" // io.MultiReader, io.Copy を使うため
	"log"
	"os"
	"strings" // strings.NewReader を使うため
)

func main() {
	// --- 複数の Reader を準備 ---
	reader1 := strings.NewReader("最初の部分。") // 文字列から Reader を作成
	reader2 := strings.NewReader("これは真ん中の部分です。")
	reader3 := strings.NewReader("そして最後の部分。")

	// --- io.MultiReader で連結 ---
	// reader1, reader2, reader3 をこの順番で連結した新しい Reader を作成
	multiReader := io.MultiReader(reader1, reader2, reader3)

	fmt.Println("--- MultiReader から io.Copy で読み込み ---")

	// ★ multiReader は io.Reader なので io.Copy に渡せる ★
	// os.Stdout は io.Writer
	bytesCopied, err := io.Copy(os.Stdout, multiReader)
	if err != nil {
		log.Fatalf("コピー失敗: %v", err)
	}
	fmt.Printf("\n(合計 %d バイトコピーしました)\n", bytesCopied)

	// --- 読み込み後の各 Reader の状態 ---
	// MultiReader から読み込むと、元の Reader の読み取り位置も進む
	fmt.Println("\n--- 読み込み後の各 Reader の状態 ---")
	// もう一度 reader1 から読み込もうとしても、既に EOF になっている
	n1, err1 := reader1.Read([]byte{0}) // 0バイト読み込みを試みる
	fmt.Printf("reader1: 読み込みバイト=%d, エラー=%v\n", n1, err1) // err1 は io.EOF

	n2, err2 := reader2.Read([]byte{0})
	fmt.Printf("reader2: 読み込みバイト=%d, エラー=%v\n", n2, err2) // err2 は io.EOF

	n3, err3 := reader3.Read([]byte{0})
	fmt.Printf("reader3: 読み込みバイト=%d, エラー=%v\n", n3, err3) // err3 は io.EOF
}

/* 実行結果:
--- MultiReader から io.Copy で読み込み ---
最初の部分。これは真ん中の部分です。そして最後の部分。
(81 バイトコピーしました)

--- 読み込み後の各 Reader の状態 ---
reader1: 読み込みバイト=0, エラー=EOF
reader2: 読み込みバイト=0, エラー=EOF
reader3: 読み込みバイト=0, エラー=EOF
*/
```

**コード解説:**

*   `strings.NewReader` で3つの `io.Reader` (`reader1`, `reader2`, `reader3`) を作成します。
*   `multiReader := io.MultiReader(reader1, reader2, reader3)`: これら3つの Reader を連結した `multiReader` を作成します。
*   `io.Copy(os.Stdout, multiReader)`: `multiReader` からデータを読み込み、標準出力に書き込みます。`io.Copy` は内部で `multiReader.Read` を呼び出します。`multiReader` はまず `reader1` から読み込み、`reader1` が EOF になると次に `reader2` から、そして `reader3` から読み込みます。
*   結果として、3つの文字列が連結されて標準出力に出力されます。
*   `io.Copy` が完了した後、元の `reader1`, `reader2`, `reader3` はすべて終端まで読み込まれた状態 (EOF) になっています。

`io.MultiReader` は、複数のファイルの内容を連続して処理したい場合や、ヘッダー情報とボディデータを別々の Reader として持っているが、それらを一つのストリームとして扱いたい場合などに便利です。