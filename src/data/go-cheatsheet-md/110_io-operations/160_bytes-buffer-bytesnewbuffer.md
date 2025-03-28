---
title: "I/O 操作: バイトバッファ (`bytes.Buffer`)"
tags: ["io-operations", "io", "bytes", "Buffer", "NewBuffer", "NewBufferString", "Reader", "Writer", "メモリ", "バッファ"]
---

`bytes` パッケージの **`Buffer`** 型は、**可変長のバイトシーケンス**をメモリ上に保持するためのバッファを提供します。`bytes.Buffer` の大きな特徴は、**`io.Reader` と `io.Writer` の両方のインターフェースを満たしている**ことです。これにより、メモリ上でデータを効率的に構築したり、`io.Reader` や `io.Writer` を必要とする関数との間でデータを簡単にやり取りしたりできます。

`import "bytes"` として利用します。

## `bytes.Buffer` の作成

*   **`var buffer bytes.Buffer`**: ゼロ値の `bytes.Buffer` はすぐに使用可能な空のバッファです。
*   **`bytes.NewBuffer(buf []byte)`**: 既存のバイトスライス `buf` の内容で初期化された新しい `Buffer` を作成します。バッファは `buf` のコピーではなく、`buf` を直接参照します（注意が必要な場合あり）。
*   **`bytes.NewBufferString(s string)`**: 文字列 `s` の内容で初期化された新しい `Buffer` を作成します。

## `bytes.Buffer` の主なメソッド

`bytes.Buffer` は `io.Reader` と `io.Writer` のメソッドに加えて、多くの便利なメソッドを提供します。

**書き込み系 (`io.Writer` 関連):**

*   `Write(p []byte) (n int, err error)`: バイトスライス `p` の内容をバッファの末尾に追加します。
*   `WriteString(s string) (n int, err error)`: 文字列 `s` をバッファの末尾に追加します。
*   `WriteByte(c byte) error`: 1バイト `c` をバッファの末尾に追加します。
*   `WriteRune(r rune) (n int, err error)`: 1ルーン `r` を UTF-8 エンコードしてバッファの末尾に追加します。

**読み込み系 (`io.Reader` 関連):**

*   `Read(p []byte) (n int, err error)`: バッファの未読部分からデータを読み込み、`p` に格納します。読み込んだ分だけバッファの内部的な読み取り位置が進みます。バッファが空になると `io.EOF` を返します。
*   `ReadByte() (byte, error)`: 1バイト読み込んで返します。
*   `ReadRune() (r rune, size int, err error)`: 1ルーン読み込んで返します。
*   `ReadString(delim byte) (line string, err error)`: 区切り文字 `delim` まで読み込んで文字列として返します。
*   `Next(n int) []byte`: 次の `n` バイトを読み込んで返します（バッファの内容は消費されます）。

**内容へのアクセス:**

*   `Bytes() []byte`: バッファの**未読部分**の内容をバイトスライスとして返します。返されるスライスはバッファの内部データを直接参照しているため、変更してはいけません。
*   `String() string`: バッファの**未読部分**の内容を文字列として返します。
*   `Len() int`: バッファの**未読部分**のバイト数を返します。

**その他:**

*   `Reset()`: バッファの内容を空にします。
*   `Grow(n int)`: バッファの容量を少なくとも `n` バイト増加させます。
*   `ReadFrom(r io.Reader) (n int64, err error)`: `io.Reader` `r` からデータを読み込み、バッファに追加します。
*   `WriteTo(w io.Writer) (n int64, err error)`: バッファの未読部分の内容を `io.Writer` `w` に書き込みます。

## コード例

```go title="bytes.Buffer の使用例"
package main

import (
	"bytes" // bytes.Buffer を使うため
	"fmt"
	"io"
	"os"
)

func main() {
	// --- Buffer の作成と書き込み ---
	fmt.Println("--- 作成と書き込み ---")
	var buffer bytes.Buffer // 空のバッファを作成

	// WriteString で書き込み
	buffer.WriteString("Hello, ")
	// Write で書き込み
	buffer.Write([]byte("Buffer!"))
	// WriteByte で書き込み
	buffer.WriteByte('\n')
	// Fprintf も使える (buffer は io.Writer)
	fmt.Fprintf(&buffer, "現在の長さ: %d\n", buffer.Len())

	// --- 内容の取得 ---
	fmt.Println("\n--- 内容の取得 ---")
	fmt.Printf("String(): %s", buffer.String()) // 未読部分全体を文字列で取得
	// fmt.Printf("Bytes(): %v\n", buffer.Bytes()) // 未読部分全体をバイトスライスで取得

	// --- Buffer からの読み込み (Reader として使う) ---
	fmt.Println("\n--- 読み込み ---")
	// ReadString で1行読み込む
	line, err := buffer.ReadString('\n')
	if err != nil { log.Fatalf("ReadString 失敗: %v", err) }
	fmt.Printf("ReadString('\\n'): %s", line) // "Hello, Buffer!\n"

	// 残りの部分を ReadAll で読み込む
	remaining, err := io.ReadAll(&buffer) // &buffer は io.Reader
	if err != nil { log.Fatalf("ReadAll 失敗: %v", err) }
	fmt.Printf("ReadAll (残り): %s", string(remaining)) // "現在の長さ: 28\n"

	// バッファは空になった
	fmt.Printf("読み込み後の Len(): %d\n", buffer.Len()) // 0

	// --- Buffer への書き込み (Writer として使う) ---
	fmt.Println("\n--- Writer として利用 ---")
	buffer.Reset() // バッファをリセット
	source := strings.NewReader("io.Copy で書き込むデータ。")
	fmt.Println("io.Copy で Buffer に書き込みます...")
	// io.Copy の第一引数 (Writer) に Buffer のポインタを渡す
	_, err = io.Copy(&buffer, source)
	if err != nil { log.Fatalf("io.Copy 失敗: %v", err) }
	fmt.Printf("書き込み後の Buffer 内容: %s\n", buffer.String())

}

/* 実行結果:
--- 作成と書き込み ---

--- 内容の取得 ---
String(): Hello, Buffer!
現在の長さ: 28

--- 読み込み ---
ReadString('\n'): Hello, Buffer!
ReadAll (残り): 現在の長さ: 28
読み込み後の Len(): 0

--- Writer として利用 ---
io.Copy で Buffer に書き込みます...
書き込み後の Buffer 内容: io.Copy で書き込むデータ。
*/
```

**コード解説:**

*   `var buffer bytes.Buffer`: 空のバッファを作成します。
*   `WriteString`, `Write`, `WriteByte`, `Fprintf` を使ってバッファにデータを書き込みます。データはメモリに追加されていきます。
*   `buffer.String()` でバッファの現在の内容（まだ読み取られていない部分）を文字列として取得できます。
*   `buffer.ReadString('\n')` はバッファから最初の改行までを読み取り、その部分をバッファから消費します。
*   `io.ReadAll(&buffer)` は、`ReadString` で読み取られなかった残りの部分をすべて読み取ります。
*   `buffer.Reset()` でバッファを空にします。
*   `io.Copy(&buffer, source)` では、`&buffer` を `io.Writer` として `io.Copy` に渡し、`source` (`io.Reader`) の内容をバッファに書き込んでいます。

`bytes.Buffer` は、メモリ上でバイトデータを段階的に構築したり、`io.Reader` と `io.Writer` の間でデータを一時的に保持したり、テストで I/O をシミュレートしたりするなど、非常に多くの場面で役立つ便利な型です。