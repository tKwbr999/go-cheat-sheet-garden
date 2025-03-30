## タイトル
title: 複数の Reader の連結 (`io.MultiReader`)

## タグ
tags: ["io-operations", "io", "MultiReader", "Reader", "連結", "ストリーム"]

## コード
```go
package main

import (
	"fmt"
	"io" // io.MultiReader, io.Copy
	"log"
	"os"
	"strings" // strings.NewReader
)

func main() {
	// 複数の Reader を準備
	r1 := strings.NewReader("First part. ")
	r2 := strings.NewReader("Second part. ")
	r3 := strings.NewReader("Third part.")

	// io.MultiReader で連結
	multiReader := io.MultiReader(r1, r2, r3)

	fmt.Println("--- Reading from MultiReader ---")

	// 連結された Reader から io.Copy で読み込む
	bytesCopied, err := io.Copy(os.Stdout, multiReader) // 標準出力へコピー
	fmt.Println() // 改行
	if err != nil {
		log.Fatalf("Copy failed: %v", err)
	}
	fmt.Printf("(Copied %d bytes)\n", bytesCopied)

	// 読み込み後、元の r1, r2, r3 は EOF になっている
}

```

## 解説
```text
複数の `io.Reader` (ファイル、文字列リーダー等) を、
あたかも**一つの連続したデータソース**のように扱いたい場合、
`io` パッケージの **`MultiReader`** 関数が便利です。
`import "io"` で利用します。

**使い方:**
`r := io.MultiReader(r1, r2, ..., rN Reader)`
*   引数に連結したい `io.Reader` を順番に指定。
*   戻り値 `r` は、引数の Reader を順番に連結した
    単一の `io.Reader`。

`r` から `Read` すると、まず `r1` から読み込まれ、`r1` が `EOF` に
なると次に `r2` から、... と続き、最後の Reader が `EOF` を
返すと `r` も `EOF` を返します。

コード例では、3つの `strings.Reader` を `io.MultiReader` で連結し、
その結果 (`multiReader`) を `io.Copy` で標準出力に書き出しています。
結果として、3つの文字列が連結されて出力されます。
`io.Copy` が完了すると、元の `r1`, `r2`, `r3` はすべて
終端まで読み込まれた状態になります。

`io.MultiReader` は、複数のファイル内容を連続処理したり、
ヘッダーとボディデータを一つのストリームとして扱いたい場合に便利です。