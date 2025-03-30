## タイトル
title: ファイルへの書き込み (`file.Write`, `file.WriteString`)

## タグ
tags: ["io-operations", "io", "os", "file", "write", "WriteString", "Writer", "ファイル書き込み"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "output_write.txt"
	file, err := os.Create(fileName) // 書き込み用に作成/オープン
	if err != nil { log.Fatal(err) }
	defer file.Close() // ★ 必ず閉じる

	fmt.Printf("'%s' を書き込み用にオープン\n", fileName)

	// file.Write でバイトスライスを書き込む
	data1 := []byte("Write で書き込み\n")
	n1, err := file.Write(data1)
	if err != nil { log.Fatalf("Write 失敗: %v", err) }
	fmt.Printf("Write: %d バイト書き込み\n", n1)

	// file.WriteString で文字列を書き込む
	n2, err := file.WriteString("WriteString で書き込み\n")
	if err != nil { log.Fatalf("WriteString 失敗: %v", err) }
	fmt.Printf("WriteString: %d バイト書き込み\n", n2)

	// fmt.Fprintf(file, "Fprintf も使える\n") // *os.File は io.Writer

	fmt.Println("書き込み完了")
	// os.Remove(fileName) // 後片付け
}

```

## 解説
```text
データを少しずつファイルに書き込んだり、開いているファイルに
追記したりするには、`*os.File` が持つ **`Write`** メソッドを使います。
(`os.Create` や書き込み可能モードの `os.OpenFile` で取得した `*os.File` は
`io.Writer` インターフェースを満たします)

**`file.Write()`:**
バイトスライス `p` の内容をファイルに書き込みます。
`n, err := file.Write(p []byte)`
*   `p`: 書き込むデータ (`[]byte`)。
*   `n`: 書き込まれたバイト数。
*   `err`: エラー情報 (成功時は `nil`)。

**`file.WriteString()`:**
文字列 `s` をファイルに書き込みます (内部で `Write` を使用)。
`n, err := file.WriteString(s string)`
*   `s`: 書き込む文字列 (`string`)。
*   `n`, `err`: `Write` と同様。

コード例では `os.Create` でファイルを開き (`defer file.Close()` で
クローズ予約)、`file.Write` でバイトスライスを、
`file.WriteString` で文字列を書き込んでいます。
各操作後にエラーチェックが必要です。

**(補足)** `*os.File` は `io.Writer` なので、
`fmt.Fprintf(file, ...)` を使ってフォーマットされた文字列を
書き込むことも可能です。

`file.Write`/`WriteString` は、ファイルにデータを段階的に
書き込む場合に利用します。`os.WriteFile` と異なり、
ファイルを開いたまま複数回の書き込みが可能です。