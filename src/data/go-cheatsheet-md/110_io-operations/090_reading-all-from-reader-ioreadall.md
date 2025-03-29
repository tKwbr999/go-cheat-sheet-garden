## タイトル
title: I/O 操作: Reader からすべて読み込む (`io.ReadAll`)

## タグ
tags: ["io-operations", "io", "ReadAll", "Reader", "EOF", "メモリ", "ファイル読み込み", "HTTP"]

## コード
```go
package main

import (
	"fmt"
	"io" // io.ReadAll
	"log"
	"strings" // strings.NewReader
	// "os"
	// "net/http"
)

func main() {
	// 例: strings.Reader から読み込む
	reader := strings.NewReader("リーダーからのデータ。")
	data, err := io.ReadAll(reader) // Reader から全て読み込む

	if err != nil { // EOF 以外のエラーチェック
		log.Fatalf("ReadAll 失敗: %v", err)
	}

	// data は []byte
	fmt.Printf("読み込み成功 (%d bytes): %s\n", len(data), string(data))

	// --- 他の Reader の例 ---
	// file, _ := os.Open("file.txt")
	// defer file.Close()
	// fileData, _ := io.ReadAll(file)

	// resp, _ := http.Get("...")
	// defer resp.Body.Close()
	// bodyData, _ := io.ReadAll(resp.Body)
}

```

## 解説
```text
`io.Reader` (ファイル, HTTPレスポンスボディ, 文字列リーダー等) から、
その内容を**すべて**一度に読み込んでバイトスライス (`[]byte`) として
取得したい場合、`io` パッケージの **`ReadAll`** 関数 (Go 1.16+) が便利です。
`import "io"` で利用します。

**使い方:**
`data, err := io.ReadAll(r Reader)`
*   `r`: 読み込み元の `io.Reader`。
*   `data`: 読み込まれた全データ (`[]byte`)。
*   `err`: 読み込み中に `io.EOF` **以外**のエラーが発生した場合のエラー。
    成功時 (EOF含む) は `nil`。

`io.ReadAll` は内部で `r.Read` を繰り返し呼び出し、
終端 (`io.EOF`) に達するまでデータを読み込み、結合して返します。
`io.EOF` はエラーではなく正常な終了とみなされます。

コード例では `strings.NewReader` から全データを読み込んでいます。
コメントアウト部分のように `*os.File` や `http.Response.Body` など、
他の `io.Reader` に対しても同様に使えます。
(`http.Response.Body` のような `io.ReadCloser` は `defer Close()` が必要)

**注意点 (os.ReadFile と同様):**
*   **メモリ使用量:** `Reader` から読み込める**全データ**をメモリに
    格納するため、**巨大なデータストリーム** (巨大ファイル等) に使うと
    メモリ不足になる可能性があります。
*   **大きなデータ:** サイズが大きい/不明な場合は `io.Copy` や
    バッファを使った `Read` ループの方が安全・効率的です。

`io.ReadAll` はデータサイズが比較的小さい場合に便利です。