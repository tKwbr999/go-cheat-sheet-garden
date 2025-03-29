## タイトル
title: I/O 操作: ファイルからの読み込み (`file.Read`)

## タグ
tags: ["io-operations", "io", "os", "file", "read", "Reader", "EOF", "ファイル読み込み", "バッファ", "ループ"]

## コード
```go
package main

import (
	"fmt"
	"io" // io.EOF
	"log"
	"os"
)

func main() {
	fileName := "example.txt" // 事前に作成しておく
	// os.WriteFile(fileName, []byte("Line1\nLine2"), 0644)

	file, err := os.Open(fileName) // 読み取り用に開く
	if err != nil { log.Fatal(err) }
	defer file.Close() // ★ 必ず閉じる

	buffer := make([]byte, 32) // 読み込み用バッファ
	totalBytes := 0
	fmt.Println("--- Reading ---")

	for {
		// バッファに読み込む
		bytesRead, err := file.Read(buffer)
		if bytesRead > 0 {
			// 読み込んだ分だけ処理 (例: 表示)
			fmt.Printf("Read %d bytes: %s\n", bytesRead, string(buffer[:bytesRead]))
			totalBytes += bytesRead
		}

		// ★ エラーチェック (EOF含む) ★
		if err != nil {
			if err == io.EOF { // ファイル終端なら正常終了
				fmt.Println("--- EOF ---")
				break // ループを抜ける
			}
			// EOF 以外のエラー
			log.Fatalf("Read error: %v", err)
		}
	}
	fmt.Printf("Total read: %d bytes\n", totalBytes)
	// os.Remove(fileName) // 後片付け
}
```

## 解説
```text
大きなファイルやデータを少しずつ処理したい場合は、
`os.ReadFile` ではなく、ファイルを開いてから
**`Read`** メソッドで部分的に読み込みます。
`*os.File` は `io.Reader` インターフェースを満たし、
`Read` メソッドを持ちます。

**`file.Read()` の使い方:**
`n, err := file.Read(p []byte)`
*   ファイルからデータを読み込み、バイトスライス `p` (バッファ) に格納。
*   `n`: 実際に読み込んだバイト数。
*   `err`: エラー情報。
    *   **`io.EOF`**: ファイル終端に達した場合の**特別なエラー値**。
        これはエラーではなく、読み込み完了の合図。
    *   その他: 読み込み中のディスクエラーなど。

**一般的な読み込みループ:**
1. バッファ (`[]byte`) を用意 (`make`)。
2. `for` ループ内で `file.Read(buffer)` を呼ぶ。
3. `n > 0` なら `buffer[:n]` を処理。
4. `err` をチェック:
   *   `err == io.EOF` なら `break` (ループ終了)。
   *   `err != nil` (EOF以外) ならエラー処理して `break`。
   *   `err == nil` ならループ継続。

コード例はこのループパターンでファイル内容を32バイトずつ読み込み、
読み込んだ部分を表示しています。`io.EOF` を正しく処理して
ループを終了させている点が重要です。

`file.Read` ループはメモリ効率良くファイルを処理する基本ですが、
より便利な `bufio.Scanner` 等も利用できます (後述)。