---
title: "I/O 操作: バッファ付きライター (`bufio.Writer`)"
tags: ["io-operations", "io", "bufio", "Writer", "NewWriter", "Flush", "バッファリング", "効率化", "ファイル書き込み"]
---

`io.Writer` に対して頻繁に小さな書き込み（例: 1バイトずつ、数バイトずつ）を行うと、その都度システムコールが発生し、パフォーマンスが低下する可能性があります。`bufio.Reader` と同様に、**バッファリング (Buffering)** を行うことで書き込み効率を改善できます。

`bufio` パッケージの **`NewWriter`** 関数は、既存の `io.Writer` をラップし、内部にバッファを持つ新しい `io.Writer` (`*bufio.Writer`) を作成します。

`import "bufio"` として利用します。

## `bufio.NewWriter()` の使い方

`bufio.NewWriter()` は、引数として元の `io.Writer` を受け取ります。

**構文:** `writer := bufio.NewWriter(wr io.Writer)`

*   `wr`: バッファリングしたい元の `io.Writer`（例: `*os.File`, `bytes.Buffer` など）。
*   戻り値 `writer`: `*bufio.Writer` 型のポインタ。これも `io.Writer` インターフェースを満たします。
*   デフォルトでは、`bufio.Writer` は 4096 バイトのバッファを持ちます。`bufio.NewWriterSize(wr, size)` を使うとバッファサイズを指定できます。

`*bufio.Writer` に対して `Write`, `WriteString`, `WriteByte` などのメソッドを呼び出すと、データはまず内部バッファに書き込まれます。バッファがいっぱいになるか、あるいは明示的に **`Flush()`** メソッドが呼び出されるまで、データは元の `wr` には書き込まれません。

## `Flush()` メソッドの重要性

**`Flush() error`**: このメソッドは、`bufio.Writer` の**内部バッファに残っているすべてのデータ**を、ラップしている元の `io.Writer` (`wr`) に書き込みます。

**重要:** `bufio.Writer` を使った場合、書き込み処理の**最後に必ず `Flush()` を呼び出す**必要があります。これを忘れると、バッファに残っていたデータがファイルなどに書き込まれず、データが欠損する可能性があります。

`defer` を使って `Flush()` を呼び出すこともできますが、`Flush()` 自体がエラーを返す可能性があるため、そのエラーを適切に処理する必要があります。

```go
writer := bufio.NewWriter(file)
defer func() {
    err := writer.Flush()
    if err != nil {
        log.Printf("警告: バッファのフラッシュに失敗: %v", err)
    }
}()
// ... writer.Write などで書き込み ...
// defer によって関数終了時に Flush が呼ばれる
```

## コード例: ファイルへのバッファ付き書き込み

```go title="bufio.Writer を使ったファイル書き込み"
package main

import (
	"bufio" // bufio.Writer を使うため
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "output_buffered.txt"

	// --- ファイルを開く (書き込み用) ---
	file, err := os.Create(fileName)
	if err != nil { log.Fatalf("ファイル作成失敗: %v", err) }
	// ★ ファイル自体の Close も defer する ★
	defer file.Close()

	// --- bufio.NewWriter でラップ ---
	writer := bufio.NewWriter(file) // file (io.Writer) をラップ

	fmt.Println("バッファ付きでファイルに書き込みます...")

	// --- データを書き込む (この時点ではバッファに書き込まれる) ---
	bytesWritten := 0
	n, err := writer.WriteString("Line 1: Buffered writing.\n")
	if err != nil { log.Fatalf("WriteString 失敗: %v", err) }
	bytesWritten += n

	n, err = writer.Write([]byte("Line 2: Using bufio.Writer.\n"))
	if err != nil { log.Fatalf("Write 失敗: %v", err) }
	bytesWritten += n

	err = writer.WriteByte('!') // 1バイト書き込み
	if err != nil { log.Fatalf("WriteByte 失敗: %v", err) }
	bytesWritten++

	fmt.Printf("バッファに %d バイト書き込みました (まだファイルには書き込まれていない可能性あり)。\n", bytesWritten)
	fmt.Printf("現在のバッファ使用量: %d バイト\n", writer.Buffered())

	// --- ★★★ 重要: Flush() でバッファの内容を書き出す ★★★ ---
	fmt.Println("Flush() を呼び出してファイルに書き込みます...")
	err = writer.Flush() // この時点で実際にファイルに書き込まれる
	if err != nil {
		log.Fatalf("Flush 失敗: %v", err)
	}
	fmt.Println("Flush() が完了しました。")
	fmt.Printf("Flush 後のバッファ使用量: %d バイト\n", writer.Buffered()) // 通常 0 になる


	// --- 確認のため、書き込んだファイルを読み込んでみる ---
	readData, readErr := os.ReadFile(fileName)
	if readErr != nil {
		log.Printf("警告: 書き込んだファイルの読み込みに失敗: %v", readErr)
	} else {
		fmt.Println("\n--- 書き込んだファイルの内容 ---")
		fmt.Print(string(readData))
		fmt.Println("-------------------------")
	}

	// --- 後片付け ---
	os.Remove(fileName)
}

/* 実行結果:
バッファ付きでファイルに書き込みます...
バッファに 58 バイト書き込みました (まだファイルには書き込まれていない可能性あり)。
現在のバッファ使用量: 58 バイト
Flush() を呼び出してファイルに書き込みます...
Flush() が完了しました。
Flush 後のバッファ使用量: 0 バイト

--- 書き込んだファイルの内容 ---
Line 1: Buffered writing.
Line 2: Using bufio.Writer.
!-------------------------
*/
```

**コード解説:**

*   `writer := bufio.NewWriter(file)`: ファイル `file` をラップする `bufio.Writer` を作成します。
*   `writer.WriteString`, `writer.Write`, `writer.WriteByte`: これらのメソッドを呼び出すと、データはまず `writer` の内部バッファに溜め込まれます。
*   `writer.Buffered()`: 現在バッファに溜まっているバイト数を返します。
*   `err = writer.Flush()`: **この呼び出しが非常に重要です**。バッファに溜まっているデータ（この例では58バイト）を、実際にラップしている `file` に書き込みます。`Flush` 後はバッファ使用量が 0 になります。
*   もし `Flush()` を呼び忘れると、`output_buffered.txt` ファイルは作成されますが、中身は空のままになってしまいます。

`bufio.Writer` は、ネットワーク接続への書き込みや、ファイルへの頻繁な小さな書き込みなど、書き込み操作のシステムコール回数を減らしてパフォーマンスを向上させたい場合に有効です。**`Flush()` の呼び出し忘れ**はよくある間違いなので、特に注意が必要です。