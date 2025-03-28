---
title: "I/O 操作: 複数への同時書き込み (`io.MultiWriter`)"
tags: ["io-operations", "io", "MultiWriter", "Writer", "同時書き込み", "ログ"]
---

あるデータを**複数の出力先**（例えば、標準出力とファイルの両方、あるいは複数のファイルやネットワーク接続）に**同時に書き込みたい**場合があります。このような場合に便利なのが `io` パッケージの **`MultiWriter`** 関数です。

`import "io"` として利用します。

## `io.MultiWriter()` の使い方

`io.MultiWriter()` は、引数として**任意の数の `io.Writer`**（可変長引数）を受け取り、それらすべてにデータを書き込む単一の `io.Writer` を返します。

**構文:** `w := io.MultiWriter(w1, w2, ..., wN Writer)`

*   `w1, w2, ..., wN`: 同時に書き込みたい `io.Writer` を指定します。
*   戻り値 `w`: 新しく作成された `io.Writer`。この `w` に対して `Write(p []byte)` を呼び出すと、内部的に引数で渡された `w1`, `w2`, ..., `wN` のそれぞれに対して順番に `Write(p)` が呼び出されます。
*   **エラーハンドリング:** いずれかの Writer への書き込みでエラーが発生した場合、`MultiWriter` の `Write` はその**最初のエラー**を返します。

## コード例: 標準出力とファイルへの同時ログ出力

ログメッセージをコンソール（標準出力）に表示しつつ、同時にファイルにも書き出す例を見てみましょう。

```go title="io.MultiWriter の使用例"
package main

import (
	"bytes" // bytes.Buffer を使うため
	"fmt"
	"io" // io.MultiWriter を使うため
	"log"
	"os"
)

func main() {
	logFileName := "app.log"

	// --- 書き込み先を準備 ---
	// 1. 標準出力 (os.Stdout は io.Writer)
	stdoutWriter := os.Stdout

	// 2. ログファイル (os.Create で io.Writer を取得)
	logFile, err := os.Create(logFileName)
	if err != nil {
		log.Fatalf("ログファイルの作成に失敗: %v", err)
	}
	defer logFile.Close()

	// 3. メモリ上のバッファ (bytes.Buffer は io.Writer)
	var buffer bytes.Buffer


	// --- io.MultiWriter で複数の Writer を束ねる ---
	// 標準出力、ログファイル、メモリバッファの3つに同時に書き込む Writer を作成
	multiWriter := io.MultiWriter(stdoutWriter, logFile, &buffer)

	fmt.Println("--- MultiWriter への書き込み開始 ---")

	// ★ multiWriter に書き込むと、stdoutWriter, logFile, buffer のすべてに書き込まれる ★
	message := "これは重要なログメッセージです。\n"
	n, err := io.WriteString(multiWriter, message) // WriteString を使う例
	if err != nil {
		log.Fatalf("MultiWriter への書き込み失敗: %v", err)
	}
	fmt.Printf("(%d バイト書き込みました)\n", n)

	// Fprintf なども使える
	fmt.Fprintf(multiWriter, "現在の時刻: %s\n", time.Now().Format(time.RFC3339))

	fmt.Println("--- MultiWriter への書き込み終了 ---")


	// --- 結果の確認 ---
	fmt.Println("\n--- メモリバッファの内容 ---")
	fmt.Print(buffer.String()) // バッファの内容を表示

	// ログファイルの内容を確認 (読み込んで表示)
	logContent, err := os.ReadFile(logFileName)
	if err != nil {
		log.Printf("警告: ログファイルの読み込み失敗: %v", err)
	} else {
		fmt.Println("\n--- ログファイルの内容 ---")
		fmt.Print(string(logContent))
	}

	// --- 後片付け ---
	os.Remove(logFileName)
}

/* 実行結果 (標準出力の内容):
--- MultiWriter への書き込み開始 ---
これは重要なログメッセージです。
(51 バイト書き込みました)
現在の時刻: 2025-03-29T02:06:00+09:00
--- MultiWriter への書き込み終了 ---

--- メモリバッファの内容 ---
これは重要なログメッセージです。
現在の時刻: 2025-03-29T02:06:00+09:00

--- ログファイルの内容 ---
これは重要なログメッセージです。
現在の時刻: 2025-03-29T02:06:00+09:00
*/
```

**コード解説:**

*   `stdoutWriter`, `logFile`, `&buffer` という3つの `io.Writer` を準備します。`bytes.Buffer` はポインタ (`&buffer`) を渡す必要がある点に注意してください。
*   `multiWriter := io.MultiWriter(stdoutWriter, logFile, &buffer)`: これら3つの Writer を束ねた `multiWriter` を作成します。
*   `io.WriteString(multiWriter, message)` や `fmt.Fprintf(multiWriter, ...)` を呼び出すと、そのデータが標準出力、ログファイル、メモリバッファの**すべて**に書き込まれます。
*   実行結果を見ると、標準出力にメッセージが表示され、さらにメモリバッファとログファイルにも同じ内容が書き込まれていることが確認できます。

`io.MultiWriter` は、同じデータを複数の場所に同時に出力したい場合に非常に便利です。例えば、標準的なログ出力（コンソールとファイルの両方）や、HTTPレスポンスをクライアントに返しつつファイルにも保存する、といった用途で活用できます。