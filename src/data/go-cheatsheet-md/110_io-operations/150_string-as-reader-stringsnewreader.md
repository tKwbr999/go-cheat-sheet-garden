## タイトル
title: I/O 操作: 文字列を Reader として扱う (`strings.NewReader`)

## タグ
tags: ["io-operations", "io", "strings", "Reader", "NewReader", "テスト", "メモリ"]

## コード
```go
package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"strings" // strings.NewReader
)

// io.Reader を受け取る関数 (例)
func printContent(r io.Reader) error {
	fmt.Println("--- Content ---")
	_, err := io.Copy(os.Stdout, r) // Reader から標準出力へコピー
	fmt.Println("\n---------------")
	return err
}

func main() {
	myString := "メモリ上の文字列データ。\nReader として扱える。"

	// strings.NewReader で文字列から Reader を作成
	stringReader := strings.NewReader(myString)

	// io.Reader を引数に取る関数に渡す
	err := printContent(stringReader)
	if err != nil { log.Fatal(err) }

	// 読み込み後は EOF になっている
	// n, readErr := stringReader.Read([]byte{0}) // n=0, readErr=io.EOF

	// Seek も可能 (io.Seeker を満たす)
	// stringReader.Seek(10, io.SeekStart)
}

```

## 解説
```text
`io.Reader` を引数に取る関数に対し、ファイル等ではなく
メモリ上の**文字列**をデータソースとして渡したい場合、
`strings` パッケージの **`NewReader`** 関数が便利です。
`import "strings"` で利用します。

**使い方:**
`reader := strings.NewReader(s string)`
*   `s`: データソースとなる文字列。
*   `reader`: `*strings.Reader` 型のポインタ。
    これは `io.Reader` インターフェースを満たし、
    文字列の内容をバイトとして読み取れます。
    (他にも `io.Seeker`, `io.ReaderAt` 等も満たす)

`*strings.Reader` は、`Read` が呼ばれると文字列の
対応部分のバイトデータを返し、終端に達すると `io.EOF` を返します。

コード例では、`strings.NewReader` で作成した `stringReader` を、
`io.Reader` を引数に取る `printContent` 関数に渡しています。
`printContent` 内の `io.Copy` は `stringReader` からデータを読み込み、
標準出力にコピーします。

一度最後まで読み込むと、再度 `Read` しようとしても `io.EOF` が返ります。
`Seek` メソッドで読み取り位置を変更することも可能です。

**利用シーン:**
*   **テスト:** ファイル等の代わりにテスト用文字列データを Reader として使う。
*   **API:** `io.Reader` を要求する API (例: `http.NewRequest` ボディ) に
    文字列データを渡す。
*   **データ処理:** 文字列データを他の `io.Reader` と同様に扱いたい場合。