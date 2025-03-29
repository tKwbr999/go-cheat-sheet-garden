## タイトル
title: I/O 操作: 複数への同時書き込み (`io.MultiWriter`)

## タグ
tags: ["io-operations", "io", "MultiWriter", "Writer", "同時書き込み", "ログ"]

## コード
```go
package main

import (
	"bytes" // bytes.Buffer
	"fmt"
	"io" // io.MultiWriter, io.WriteString
	"log"
	"os"
)

func main() {
	// 書き込み先を準備
	w1 := os.Stdout      // 1. 標準出力
	var w2 bytes.Buffer // 2. メモリバッファ (io.Writer を満たす)
	// w3, _ := os.Create("file.log") // 3. ファイル (例)
	// defer w3.Close()

	// io.MultiWriter で複数の Writer を束ねる
	// ここでは標準出力とメモリバッファに書き込む Writer を作成
	multiWriter := io.MultiWriter(w1, &w2) // バッファはポインタを渡す

	fmt.Println("--- Writing to MultiWriter ---")

	// multiWriter に書き込むと、w1 と w2 の両方に書き込まれる
	message := "Log message.\n"
	n, err := io.WriteString(multiWriter, message)
	if err != nil {
		log.Fatalf("Write failed: %v", err)
	}
	fmt.Printf("(Wrote %d bytes)\n", n)

	fmt.Println("--- End Writing ---")

	// 結果確認 (バッファの内容)
	fmt.Println("\n--- Buffer Content ---")
	fmt.Print(w2.String()) // "Log message.\n" が入っている
}

```

## 解説
```text
あるデータを**複数の出力先** (標準出力とファイル、等) に
**同時に書き込みたい**場合、`io` パッケージの
**`MultiWriter`** 関数が便利です。
`import "io"` で利用します。

**使い方:**
`w := io.MultiWriter(w1, w2, ..., wN Writer)`
*   引数に同時に書き込みたい `io.Writer` を指定。
*   戻り値 `w` は新しい `io.Writer`。
*   `w.Write(p)` を呼び出すと、内部的に引数で渡された
    `w1`, `w2`, ... のそれぞれに順番に `Write(p)` が呼び出される。
*   **エラー:** いずれかの Writer への書き込みでエラーが発生した場合、
    その**最初のエラー**を返す。

コード例では、`os.Stdout` (標準出力) と `bytes.Buffer` (メモリバッファ)
の2つを `io.MultiWriter` で束ねています (`bytes.Buffer` はポインタ渡し)。
`io.WriteString(multiWriter, ...)` を呼び出すと、
メッセージがコンソールに表示され、かつ `w2` (バッファ) にも
同じ内容が書き込まれます。

`io.MultiWriter` は、同じデータを複数の場所に同時に出力したい場合に
非常に便利です (例: ログをコンソールとファイル両方に出力する)。