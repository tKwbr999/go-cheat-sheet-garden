## タイトル
title: I/O 操作: CSV データの読み込み (`encoding/csv`)

## タグ
tags: ["io-operations", "encoding/csv", "csv", "Reader", "ReadAll", "Read", "ファイル読み込み", "データ解析"]

## コード
```go
package main

import (
	"encoding/csv" // csv パッケージ
	"fmt"
	"io"
	"log"
	"strings"
	// "os" // ファイルから読む場合は os.Open
)

func main() {
	csvData := `"Name","Age","City"\n"Alice","30","New York"\n"Bob","","London"`

	// csv.NewReader でリーダー作成
	reader := csv.NewReader(strings.NewReader(csvData))
	// reader.Comma = '\t' // タブ区切りなど、オプション設定可能

	fmt.Println("--- Reading CSV record by record ---")
	// ヘッダー行読み飛ばし (オプション)
	// header, _ := reader.Read()
	// fmt.Println("Header:", header)

	for {
		// Read() で1レコード (1行) ずつ読み込む
		record, err := reader.Read()
		if err != nil {
			if err == io.EOF { break } // 終端でループ終了
			log.Fatal(err) // EOF 以外のエラー
		}
		// record は []string (フィールドのスライス)
		fmt.Printf("Record: %v, Fields: %d\n", record, len(record))
		// fmt.Printf(" Name: %s, Age: %s\n", record[0], record[1])
	}
	fmt.Println("Finished reading.")
}

```

## 解説
```text
CSV (Comma-Separated Values) データの読み書きには、
標準ライブラリ **`encoding/csv`** パッケージを使います。
`import "encoding/csv"` で利用します。

**CSVリーダーの作成:**
`csv.NewReader(r io.Reader)` で `*csv.Reader` を作成。
引数 `r` には `*os.File` や `strings.Reader` などを渡します。

**読み込み方法:**
1. **`ReadAll() ([][]string, error)`**:
   *   全レコードを一度に読み込み `[][]string` で返す。
   *   大きなファイルには不向き。
2. **`Read() ([]string, error)`**:
   *   1レコード (1行) を `[]string` (フィールドのスライス) で返す。
   *   終端では `io.EOF` エラーを返す。
   *   通常 `for` ループで `io.EOF` まで繰り返し呼び出す。
       大きなファイルに適している。

コード例では `Read()` を使ったループ処理を示しています。
`reader.Read()` で1行分のフィールド (`[]string`) を取得し、
`io.EOF` が返るまで繰り返します。

**リーダーオプション:**
`*csv.Reader` のフィールドで動作をカスタマイズできます。
*   `Comma rune`: 区切り文字 (デフォルト `,`)。TSVなら `'\t'`。
*   `Comment rune`: コメント文字。その文字で始まる行を無視。
*   `FieldsPerRecord int`: レコード毎の期待フィールド数 (0は可変)。
*   `LazyQuotes bool`: クォート解釈を緩くする。
*   `TrimLeadingSpace bool`: フィールド先頭の空白を削除。

`encoding/csv` はCSVデータの読み込みを簡単かつ効率的に行えます。
大きなファイルは `Read()` ループで処理しましょう。