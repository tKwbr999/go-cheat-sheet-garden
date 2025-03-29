## タイトル
title: バッファ付きリーダー (`bufio.NewReader`)

## タグ
tags: ["io-operations", "io", "bufio", "Reader", "NewReader", "バッファリング", "効率化", "ReadString", "ReadByte"]

## コード
```go
package main

import (
	"bufio" // bufio パッケージ
	"fmt"
	"io"
	"log"
	"os"
	// "strings"
)

func main() {
	fileName := "example.txt" // 事前に作成しておく
	// os.WriteFile(fileName, []byte("Line1\nLine2\n"), 0644)

	file, err := os.Open(fileName)
	if err != nil { log.Fatal(err) }
	defer file.Close()

	// bufio.NewReader でラップ
	reader := bufio.NewReader(file)

	fmt.Println("--- Reading line by line ---")
	for {
		// ReadString('\n') で改行まで読み込む
		line, err := reader.ReadString('\n')
		if len(line) > 0 {
			fmt.Print(line) // 読み込んだ行を表示 (改行含む)
		}

		// エラーチェック (EOF含む)
		if err != nil {
			if err == io.EOF {
				fmt.Println("--- EOF ---")
				break
			}
			log.Fatalf("Read error: %v", err)
		}
	}
	// os.Remove(fileName) // 後片付け
}

```

## 解説
```text
`io.Reader` から少しずつデータを読む場合、システムコールが
頻繁に発生し非効率になることがあります。
**バッファリング**で I/O 効率を改善できます。

`bufio` パッケージの **`NewReader`** は、既存の `io.Reader` を
ラップし、内部バッファを持つ新しい `io.Reader` (`*bufio.Reader`) を
作成します。`import "bufio"` で利用します。

**使い方:**
`reader := bufio.NewReader(rd io.Reader)`
*   `rd`: 元の `io.Reader` (例: `*os.File`)。
*   `reader`: `*bufio.Reader` (これも `io.Reader`)。
*   デフォルトバッファサイズは 4096 バイト
    (`NewReaderSize` で指定可)。

`bufio.Reader` は `rd` からデータを先読みして内部バッファに保持し、
`Read` 要求にはまずバッファから応えようとするため、
`rd` への実際の読み込み回数を減らせます。

**便利なメソッド:**
`*bufio.Reader` は標準 `Read` に加え以下等を提供:
*   `ReadByte()`: 1バイト読み込み。
*   `ReadRune()`: 1 rune (UTF-8文字) 読み込み。
*   `ReadString(delim byte)`: 区切り文字 `delim` (例: `'\n'`) まで読み込み。
*   `ReadLine()`: 1行読み込み (通常 `ReadString` や `Scanner` が便利)。
*   `Peek(n int)`: 次の `n` バイトを覗き見 (状態は進めない)。

コード例では `bufio.NewReader` でファイルをラップし、
`ReadString('\n')` をループで呼び出してファイルを行単位で読み込み、
`io.EOF` でループを終了しています。

`bufio.Reader` は区切り文字ベースの読み込みや多数の小さな `Read` で
パフォーマンス向上に役立ちます。行単位読み込みには `bufio.Scanner`
(後述) がさらに便利な場合もあります。