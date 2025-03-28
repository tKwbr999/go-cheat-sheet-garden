---
title: "I/O 操作: 文字列を Reader として扱う (`strings.NewReader`)"
tags: ["io-operations", "io", "strings", "Reader", "NewReader", "テスト", "メモリ"]
---

`io.Reader` インターフェースを引数として受け取る関数（例: `io.Copy`, `json.Decoder.Decode`, `http.NewRequest` など）に対して、ファイルやネットワーク接続ではなく、**メモリ上にある文字列**をデータソースとして渡したい場合があります。このような場合に便利なのが `strings` パッケージの **`NewReader`** 関数です。

`import "strings"` として利用します。

## `strings.NewReader()` の使い方

`strings.NewReader()` は、引数として渡された文字列 (`string`) から読み取るための `io.Reader` を作成して返します。

**構文:** `reader := strings.NewReader(s string)`

*   `s`: データソースとなる文字列。
*   戻り値 `reader`: `*strings.Reader` 型のポインタ。この型は以下のインターフェースを満たします。
    *   `io.Reader`: `Read` メソッドを提供し、文字列の内容をバイトとして読み取れます。
    *   `io.ReaderAt`: 特定のオフセットから読み取る `ReadAt` メソッドを提供します。
    *   `io.Seeker`: `Seek` メソッドを提供し、読み取り位置を変更できます。
    *   `io.WriterTo`: 自身のデータを効率的に `io.Writer` に書き込む `WriteTo` メソッドを提供します (`io.Copy` などで利用されます)。
    *   `io.ByteReader`: `ReadByte` メソッドを提供します。
    *   `io.RuneReader`: `ReadRune` メソッドを提供します。

`*strings.Reader` は、文字列の内容を内部的に保持し、`Read` メソッドなどが呼び出されるたびに、文字列の対応する部分のバイトデータを返します。文字列の終端に達すると `io.EOF` を返します。

## コード例

```go title="strings.NewReader の使用例"
package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"strings" // strings.NewReader を使うため
)

// io.Reader を受け取って内容を表示する関数 (例)
func printReaderContent(r io.Reader) error {
	fmt.Println("--- Reader の内容 ---")
	// io.Copy で Reader から標準出力 (os.Stdout) へコピー
	_, err := io.Copy(os.Stdout, r)
	fmt.Println("\n--------------------")
	return err
}

func main() {
	myString := "これはメモリ上の文字列データです。\nio.Reader として扱えます。"

	// --- strings.NewReader で Reader を作成 ---
	stringReader := strings.NewReader(myString)

	// --- 作成した Reader を関数に渡す ---
	err := printReaderContent(stringReader)
	if err != nil {
		log.Fatalf("printReaderContent 失敗: %v", err)
	}

	// --- Reader の状態 ---
	// printReaderContent で最後まで読み込まれたので、再度読み込もうとしても EOF になる
	fmt.Println("\n--- 再度読み込み試行 ---")
	n, readErr := stringReader.Read([]byte{0}) // 0バイト読み込み
	fmt.Printf("読み込みバイト=%d, エラー=%v\n", n, readErr) // エラーは io.EOF

	// --- Seek 操作も可能 ---
	fmt.Println("\n--- Seek 操作 ---")
	// stringReader は io.Seeker も満たす
	// 例: 先頭から 10 バイト目に移動 (UTF-8 のバイト単位)
	newPos, seekErr := stringReader.Seek(10, io.SeekStart)
	if seekErr != nil { log.Fatalf("Seek 失敗: %v", seekErr) }
	fmt.Printf("Seek 後オフセット: %d\n", newPos)

	// Seek した位置から再度読み込み
	remainingData, _ := io.ReadAll(stringReader)
	fmt.Printf("Seek 後に読み込んだ内容: %s\n", string(remainingData))

}

/* 実行結果:
--- Reader の内容 ---
これはメモリ上の文字列データです。
io.Reader として扱えます。
--------------------

--- 再度読み込み試行 ---
読み込みバイト=0, エラー=EOF

--- Seek 操作 ---
Seek 後オフセット: 10
Seek 後に読み込んだ内容: 上の文字列データです。
io.Reader として扱えます。
*/
```

**コード解説:**

*   `stringReader := strings.NewReader(myString)`: 文字列 `myString` をデータソースとする `*strings.Reader` を作成します。
*   `printReaderContent(stringReader)`: `io.Reader` を引数に取る関数 `printReaderContent` に `stringReader` を渡しています。関数内では `io.Copy` を使って Reader の内容を標準出力にコピーしています。
*   `stringReader.Read([]byte{0})`: `printReaderContent` で最後まで読み込まれた後なので、`Read` を呼び出すと `io.EOF` が返されます。
*   `stringReader.Seek(10, io.SeekStart)`: `*strings.Reader` は `io.Seeker` も実装しているため、`Seek` メソッドで読み取り位置を変更できます。ここでは先頭から10バイト目に移動しています。
*   `io.ReadAll(stringReader)`: Seek 後の位置から残りのデータをすべて読み込んでいます。

`strings.NewReader` は、以下のような場合に特に便利です。

*   **テスト:** ファイルやネットワーク接続の代わりに、テストケースごとに異なる文字列データを `io.Reader` としてモックしたい場合。
*   **API:** `io.Reader` を要求する API (例: `http.NewRequest` のボディ) に、メモリ上の文字列データを渡したい場合。
*   **データ処理:** 文字列データを、ファイルなど他の `io.Reader` と同じように扱いたい場合。