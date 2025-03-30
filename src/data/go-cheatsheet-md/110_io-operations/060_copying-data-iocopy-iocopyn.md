## タイトル
title: データのコピー (`io.Copy`, `io.CopyN`)

## タグ
tags: ["io-operations", "io", "copy", "Copy", "CopyN", "Reader", "Writer", "ファイルコピー"]

## コード
```go
package main

import (
	"fmt"
	"io" // io.Copy
	"log"
	"os"
	// "strings" // strings.NewReader の例は省略
)

func main() {
	// --- ファイルからファイルへのコピー ---
	srcFileName := "source.txt"
	dstFileName := "dest.txt"
	os.WriteFile(srcFileName, []byte("Source content.\n"), 0644) // 元ファイル準備

	srcFile, err := os.Open(srcFileName) // Reader として開く
	if err != nil { log.Fatal(err) }
	defer srcFile.Close()

	dstFile, err := os.Create(dstFileName) // Writer として開く
	if err != nil { log.Fatal(err) }
	defer dstFile.Close()

	// ★ io.Copy で src から dst へコピー ★
	bytesCopied, err := io.Copy(dstFile, srcFile)
	if err != nil {
		log.Fatalf("コピー失敗: %v", err)
	}
	fmt.Printf("Copied %d bytes from %s to %s\n", bytesCopied, srcFileName, dstFileName)

	// (コピー結果確認や後片付けは省略)
	// os.Remove(srcFileName); os.Remove(dstFileName)
}

```

## 解説
```text
`io.Reader` から `io.Writer` へデータを**コピー**したい場合、
`io` パッケージの **`Copy`** や **`CopyN`** が便利です。
内部的にバッファを使い効率的に処理します。
`import "io"` で利用します。

**`io.Copy()`:**
`src` から `dst` へ、`src` が終端 (`io.EOF`) に達するか
エラーが発生するまでデータをコピーします。
`written, err := io.Copy(dst Writer, src Reader)`
*   `written`: 書き込まれた合計バイト数 (`int64`)。
*   `err`: 発生した最初のエラー。成功時は `nil` (`io.EOF` は返さない)。

**`io.CopyN()`:**
コピーするバイト数を最大 `n` バイトに制限します。
`written, err := io.CopyN(dst Writer, src Reader, n int64)`
*   `n`: 最大コピーバイト数。
*   `written`: 書き込まれたバイト数 (`<= n`)。
*   `err`: エラー情報。`n` バイトコピー前に `src` が `EOF` に
    なると `io.EOF` を返す。`n` バイト成功時は `nil`。

コード例では、`os.Open` で開いた `srcFile` (`io.Reader`) から
`os.Create` で開いた `dstFile` (`io.Writer`) へ
`io.Copy` を使ってファイル内容全体をコピーしています。
ループやバッファ管理は不要です。

**(補足)** `strings.NewReader` で文字列を `io.Reader` にしたり、
`os.Stdout` を `io.Writer` として使うことも可能です。

`io.Copy` はファイルコピー、HTTPレスポンス書き込み、
ストリーミング処理など、`Reader` から `Writer` への
データ転送に非常に便利で効率的な方法です。