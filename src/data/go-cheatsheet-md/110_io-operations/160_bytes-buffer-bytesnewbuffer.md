## タイトル
title: バイトバッファ (`bytes.Buffer`)

## タグ
tags: ["io-operations", "io", "bytes", "Buffer", "NewBuffer", "NewBufferString", "Reader", "Writer", "メモリ", "バッファ"]

## コード
```go
package main

import (
	"bytes" // bytes.Buffer
	"fmt"
	"io"
	"log"
	// "os"
)

func main() {
	// 空のバッファを作成
	var buffer bytes.Buffer

	// 書き込み (io.Writer として動作)
	buffer.WriteString("Hello, ")
	buffer.Write([]byte("Buffer!\n"))
	fmt.Fprintf(&buffer, "Length: %d\n", buffer.Len())

	// 内容取得
	fmt.Println("--- Content ---")
	fmt.Print(buffer.String()) // 未読部分を文字列で取得
	fmt.Println("---------------")

	// 読み込み (io.Reader として動作)
	fmt.Println("--- Reading ---")
	line, err := buffer.ReadString('\n') // 1行読み込み
	if err != nil && err != io.EOF { log.Fatal(err) }
	fmt.Printf("Read line: %s", line)

	remaining, _ := io.ReadAll(&buffer) // 残りを全て読み込み
	fmt.Printf("Read remaining: %s", string(remaining))
	fmt.Printf("Len after read: %d\n", buffer.Len()) // 0

	// buffer.Reset() // バッファを空にする
}

```

## 解説
```text
`bytes` パッケージの **`Buffer`** 型は、メモリ上に
**可変長のバイトシーケンス**を保持するバッファです。
大きな特徴は **`io.Reader` と `io.Writer` の両方を満たす**ことです。
これによりメモリ上でのデータ構築や、`Reader`/`Writer` を
必要とする関数とのデータ連携が容易になります。
`import "bytes"` で利用します。

**作成:**
*   `var buffer bytes.Buffer`: ゼロ値は空バッファ。
*   `bytes.NewBuffer(buf []byte)`: 既存スライスで初期化。
*   `bytes.NewBufferString(s string)`: 文字列で初期化。

**主なメソッド:**
*   **書き込み系 (`io.Writer`):**
    *   `Write(p []byte)`, `WriteString(s string)`, `WriteByte(c byte)`,
        `WriteRune(r rune)`: バッファ末尾に追加。
    *   `ReadFrom(r io.Reader)`: Reader から読み込み追加。
*   **読み込み系 (`io.Reader`):**
    *   `Read(p []byte)`, `ReadByte()`, `ReadRune()`,
        `ReadString(delim byte)`: バッファ先頭から読み込み (消費される)。
        空になると `io.EOF`。
    *   `Next(n int)`: 次の `n` バイト読み込み (消費される)。
*   **内容アクセス:**
    *   `Bytes() []byte`: **未読部分**をバイトスライスで取得 (変更不可)。
    *   `String() string`: **未読部分**を文字列で取得。
    *   `Len() int`: **未読部分**のバイト数。
*   **その他:**
    *   `Reset()`: バッファを空にする。
    *   `Grow(n int)`: 容量確保。
    *   `WriteTo(w io.Writer)`: 未読部分を Writer に書き込み。

コード例では、`bytes.Buffer` を作成し、`WriteString`, `Write`, `Fprintf` で
データを書き込み、`String()` で内容を確認後、`ReadString`, `io.ReadAll` で
データを読み込んでいます。`Buffer` が `io.Reader` と `io.Writer` の
両方として機能することがわかります。

`bytes.Buffer` はメモリ上でのバイトデータ構築、`io` インターフェース間の
データ一時保持、テストでの I/O モックなど、多くの場面で役立ちます。