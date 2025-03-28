---
title: "I/O 操作: データのコピー (`io.Copy`, `io.CopyN`)"
tags: ["io-operations", "io", "copy", "Copy", "CopyN", "Reader", "Writer", "ファイルコピー"]
---

`io.Reader` インターフェースを満たす値（ファイル、ネットワーク接続、メモリバッファなど）から、`io.Writer` インターフェースを満たす値（ファイル、標準出力、ネットワーク接続など）へデータを**コピー**したい場合、`io` パッケージの **`Copy`** 関数や **`CopyN`** 関数が非常に便利です。これらの関数は、内部的に適切なサイズのバッファを使って効率的にコピー処理を行います。

`import "io"` として利用します。

## `io.Copy()` の使い方

`io.Copy()` は、`src` (`io.Reader`) からデータを読み込み、`dst` (`io.Writer`) に書き込みます。`src` が `io.EOF` を返す（終端に達する）か、読み書き中にエラーが発生するまでコピーを続けます。

**構文:** `written, err := io.Copy(dst Writer, src Reader)`

*   `dst`: コピー先の `io.Writer`。
*   `src`: コピー元の `io.Reader`。
*   戻り値:
    *   `written`: 実際に `dst` に書き込まれた合計バイト数 (`int64`)。
    *   `err`: コピー中に発生した最初のエラー。成功し、`src` が `io.EOF` を返した場合は `nil` を返します（`io.EOF` 自体は返しません）。

## `io.CopyN()` の使い方

`io.CopyN()` は `io.Copy` と似ていますが、コピーするバイト数を**最大 `n` バイトまでに制限**します。

**構文:** `written, err := io.CopyN(dst Writer, src Reader, n int64)`

*   `dst`: コピー先の `io.Writer`。
*   `src`: コピー元の `io.Reader`。
*   `n`: コピーする最大バイト数 (`int64`)。
*   戻り値:
    *   `written`: 実際に `dst` に書き込まれた合計バイト数 (`int64`)。`n` 以下になります。
    *   `err`: コピー中にエラーが発生した場合、そのエラー。`n` バイトをコピーしきる前に `src` が `io.EOF` を返した場合、`io.EOF` を返します。`n` バイトを正常にコピーできた場合は `nil` を返します。

## コード例: ファイルのコピー

`io.Copy` を使ってファイルの内容を別のファイルにコピーする例です。

```go title="io.Copy を使ったファイルコピー"
package main

import (
	"fmt"
	"io" // io.Copy を使うため
	"log"
	"os"
	"strings" // strings.NewReader を使うため
)

func main() {
	// --- ファイルからファイルへのコピー ---
	fmt.Println("--- ファイルからファイルへコピー ---")
	srcFileName := "source.txt"
	dstFileName := "destination.txt"
	content := "This is the source file content.\nIt has multiple lines.\n"

	// コピー元ファイルを作成・書き込み
	err := os.WriteFile(srcFileName, []byte(content), 0644)
	if err != nil { log.Fatalf("ソースファイルの書き込み失敗: %v", err) }

	// コピー元ファイルを開く (Reader)
	srcFile, err := os.Open(srcFileName)
	if err != nil { log.Fatalf("ソースファイルのオープン失敗: %v", err) }
	defer srcFile.Close()

	// コピー先ファイルを作成 (Writer)
	dstFile, err := os.Create(dstFileName)
	if err != nil { log.Fatalf("コピー先ファイルの作成失敗: %v", err) }
	defer dstFile.Close()

	// ★ io.Copy で srcFile から dstFile へコピー ★
	bytesCopied, err := io.Copy(dstFile, srcFile)
	if err != nil {
		log.Fatalf("コピー失敗: %v", err)
	}
	fmt.Printf("'%s' から '%s' へ %d バイトコピーしました。\n", srcFileName, dstFileName, bytesCopied)

	// コピー結果を確認
	copiedData, _ := os.ReadFile(dstFileName)
	fmt.Printf("コピー先ファイルの内容:\n%s", string(copiedData))

	// --- 文字列から標準出力へのコピー ---
	fmt.Println("\n--- 文字列から標準出力へコピー ---")
	reader := strings.NewReader("この文字列を標準出力にコピーします。\n")
	// os.Stdout は io.Writer
	bytesCopiedStdout, err := io.Copy(os.Stdout, reader)
	if err != nil { log.Fatalf("標準出力へのコピー失敗: %v", err) }
	fmt.Printf("(%d バイトコピー)\n", bytesCopiedStdout)

	// --- CopyN の例 ---
	fmt.Println("\n--- CopyN の例 (最初の10バイトのみ) ---")
	readerN := strings.NewReader("0123456789ABCDEF")
	writerN := os.Stdout
	bytesCopiedN, err := io.CopyN(writerN, readerN, 10) // 最大10バイトコピー
	fmt.Println() // 改行
	if err != nil { log.Fatalf("CopyN 失敗: %v", err) }
	fmt.Printf("(%d バイトコピー)\n", bytesCopiedN)


	// --- 後片付け ---
	os.Remove(srcFileName)
	os.Remove(dstFileName)
}

/* 実行結果:
--- ファイルからファイルへコピー ---
'source.txt' から 'destination.txt' へ 54 バイトコピーしました。
コピー先ファイルの内容:
This is the source file content.
It has multiple lines.

--- 文字列から標準出力へコピー ---
この文字列を標準出力にコピーします。
(52 バイトコピー)

--- CopyN の例 (最初の10バイトのみ) ---
0123456789
(10 バイトコピー)
*/
```

**コード解説:**

*   **ファイルコピー:**
    *   `os.Open` でコピー元ファイルを `io.Reader` として開きます。
    *   `os.Create` でコピー先ファイルを `io.Writer` として開きます。
    *   `io.Copy(dstFile, srcFile)` を呼び出すだけで、`srcFile` の内容が `dstFile` に効率的にコピーされます。ループやバッファ管理を自分で行う必要はありません。
*   **文字列から標準出力:**
    *   `strings.NewReader` は文字列から `io.Reader` を作成します。
    *   `os.Stdout` は標準出力を表す `io.Writer` です。
    *   `io.Copy(os.Stdout, reader)` で文字列の内容がコンソールに出力されます。
*   **`CopyN`:**
    *   `io.CopyN(writerN, readerN, 10)` は `readerN` から最大10バイトだけ読み込み、`writerN` (標準出力) に書き込みます。

`io.Copy` は、ファイルコピー、HTTPリクエストボディの読み取りとレスポンスボディへの書き込み、データのストリーミング処理など、様々な場面で `io.Reader` から `io.Writer` へデータを転送するための非常に便利で効率的な方法です。