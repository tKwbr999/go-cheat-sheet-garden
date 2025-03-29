## タイトル
title: I/O 操作: バッファ付きライター (`bufio.Writer`)

## タグ
tags: ["io-operations", "io", "bufio", "Writer", "NewWriter", "Flush", "バッファリング", "効率化", "ファイル書き込み"]

## コード
```go
package main

import (
	"bufio" // bufio.Writer
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "output_buffered.txt"
	file, err := os.Create(fileName)
	if err != nil { log.Fatal(err) }
	defer file.Close() // ファイル自体の Close も必要

	// bufio.NewWriter でラップ
	writer := bufio.NewWriter(file)

	fmt.Println("Writing to buffer...")
	// データ書き込み (バッファへ)
	n1, _ := writer.WriteString("Buffered Write 1.\n")
	n2, _ := writer.Write([]byte("Buffered Write 2.\n"))
	_ = writer.WriteByte('!')
	fmt.Printf("Buffered: %d bytes\n", writer.Buffered()) // バッファ内のバイト数

	// ★★★ Flush でバッファ内容を書き出す ★★★
	fmt.Println("Flushing buffer...")
	err = writer.Flush() // この時点でファイルに書き込まれる
	if err != nil { log.Fatalf("Flush failed: %v", err) }
	fmt.Println("Flush complete.")
	fmt.Printf("Buffered after flush: %d bytes\n", writer.Buffered()) // 0

	// (ファイル内容確認や os.Remove は省略)
}

```

## 解説
```text
`io.Writer` に頻繁に小さな書き込みを行うと非効率な場合があります。
**バッファリング**で書き込み効率を改善できます。

`bufio` パッケージの **`NewWriter`** は、既存の `io.Writer` を
ラップし、内部バッファを持つ `*bufio.Writer` を作成します。
`import "bufio"` で利用します。

**使い方:**
`writer := bufio.NewWriter(wr io.Writer)`
*   `wr`: 元の `io.Writer` (例: `*os.File`)。
*   `writer`: `*bufio.Writer` (これも `io.Writer`)。
*   デフォルトバッファサイズ 4096 バイト (`NewWriterSize` で指定可)。

`writer` への `Write`, `WriteString` 等はまず内部バッファに書き込まれます。
バッファが一杯になるか、**`Flush()`** が呼ばれるまで、
元の `wr` には書き込まれません。

**`Flush()` メソッドの重要性:**
`err := writer.Flush()`
*   バッファに残っているデータを元の `io.Writer` に書き出す。
*   **重要:** `bufio.Writer` を使ったら、書き込み処理の
    **最後に必ず `Flush()` を呼ぶ**必要があります。
    忘れるとデータが書き込まれず欠損します。
*   `defer` で呼ぶことも可能ですが、`Flush()` 自体のエラー処理が必要です。
    ```go
    defer func() {
        if err := writer.Flush(); err != nil { /* エラー処理 */ }
    }()
    ```

コード例では `bufio.NewWriter` でファイルをラップし、
複数回書き込み後、`writer.Buffered()` でバッファ内の
バイト数を確認し、`writer.Flush()` でファイルに書き出しています。
`Flush()` を忘れるとファイルは空のままになります。

`bufio.Writer` はネットワーク書き込みやファイルへの頻繁な
小さな書き込みでパフォーマンス向上に有効です。
**`Flush()` の呼び出し忘れに注意**しましょう。