## タイトル
title: CSV データの書き込み (`encoding/csv`)

## タグ
tags: ["io-operations", "encoding/csv", "csv", "Writer", "NewWriter", "Write", "WriteAll", "Flush", "ファイル書き込み"]

## コード
```go
package main

import (
	"encoding/csv" // csv パッケージ
	"fmt"
	"log"
	"os"
	// "bytes"
)

func main() {
	records := [][]string{
		{"Header1", "Header2"},
		{"Data1", "Value, with comma"},
		{"Data2", "Value\nwith newline"},
	}
	fileName := "output.csv"

	file, err := os.Create(fileName)
	if err != nil { log.Fatal(err) }
	defer file.Close()

	// csv.NewWriter を作成 (io.Writer を渡す)
	writer := csv.NewWriter(file)
	// writer.Comma = '\t' // オプション: 区切り文字変更
	// writer.UseCRLF = true // オプション: 改行を CRLF に

	// Write で1レコードずつ書き込み
	for _, record := range records {
		err := writer.Write(record) // 自動でクォート等処理
		if err != nil { log.Fatalf("Write failed: %v", err) }
	}

	// ★ Flush でバッファ内容を書き出す (Write を使った場合は必須) ★
	writer.Flush()
	if err := writer.Error(); err != nil { // Flush 後のエラーチェック
		log.Fatalf("Flush error: %v", err)
	}

	fmt.Printf("'%s' に書き込み完了\n", fileName)
	// (ファイル内容確認や os.Remove は省略)
}

```

## 解説
```text
`encoding/csv` パッケージはCSVデータの**書き込み**もサポートします。
Goのデータ構造 (通常 `[][]string` や `[]string`) を
CSV形式で `io.Writer` に書き出せます。
`import "encoding/csv"` で利用します。

**CSVライターの作成:**
`csv.NewWriter(w io.Writer)` で `*csv.Writer` を作成。
引数 `w` には `*os.File`, `bytes.Buffer`, `os.Stdout` などを渡します。
`*csv.Writer` は内部でバッファリングするため、**最後に `Flush()` が必要**です。

**書き込み方法:**
1. **`Write(record []string) error`**:
   *   単一レコード (`[]string`) を書き込む。
   *   カンマ、ダブルクォート、改行等を自動でエスケープ/クォート。
   *   **最後に `Flush()` が必須**。
2. **`WriteAll(records [][]string) error`**:
   *   複数レコード (`[][]string`) をまとめて書き込む。
   *   内部で `Write` を繰り返し、最後に `Flush` を呼ぶ。
   *   通常、別途 `Flush()` は不要 (エラー時は注意)。

**`Flush()` メソッドの重要性:**
`err := writer.Flush()`
*   内部バッファの内容を基底の `io.Writer` に書き出す。
*   `Write` を使った場合は**最後に必ず呼び出す**こと。
    忘れるとデータが書き込まれない可能性あり。
*   `Flush` 自体のエラーもチェック (`writer.Error()`) するのが望ましい。

コード例では `csv.NewWriter` でファイル用ライターを作成し、
ループ内で `writer.Write` を呼び出して各レコードを書き込み、
最後に `writer.Flush()` でファイルへの書き出しを完了させています。
カンマや改行を含むデータが適切にクォートされていることがわかります。

**ライターオプション:**
*   `Comma rune`: 区切り文字 (デフォルト `,`)。
*   `UseCRLF bool`: 行末を CRLF (`\r\n`) にする (デフォルト `false`)。

`encoding/csv` でCSVフォーマットを気にせず簡単にデータ出力できます。
`Write` を使う場合は `Flush()` を忘れずに。