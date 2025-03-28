---
title: "I/O 操作: CSV データの書き込み (`encoding/csv`)"
tags: ["io-operations", "encoding/csv", "csv", "Writer", "NewWriter", "Write", "WriteAll", "Flush", "ファイル書き込み"]
---

`encoding/csv` パッケージは、CSVデータの読み込みだけでなく、**書き込み**もサポートしています。Goのデータ構造（通常は文字列のスライスのスライス `[][]string` や、個々の文字列スライス `[]string`）をCSV形式で `io.Writer` に書き出すことができます。

`import "encoding/csv"` として利用します。

## CSVライターの作成: `csv.NewWriter()`

CSVデータを書き込むには、まず `csv.NewWriter()` を使って `*csv.Writer` を作成します。この関数は `io.Writer` を引数に取ります。

**構文:** `writer := csv.NewWriter(w io.Writer)`

*   `w`: CSVデータを書き込む先の `io.Writer`（例: `*os.File`, `bytes.Buffer`, `os.Stdout` など）。
*   戻り値 `writer`: `*csv.Writer` 型のポインタ。

`*csv.Writer` は内部的に `bufio.Writer` を使ってバッファリングを行います。そのため、書き込み完了後には**必ず `Flush()` メソッドを呼び出す**必要があります。

## CSVデータの書き込み方法

`*csv.Writer` を使ってデータを書き込む主な方法は2つあります。

1.  **`Write(record []string) error`**:
    *   単一のレコード（文字列スライス `[]string`）を書き込みます。各要素がフィールドに対応します。
    *   必要に応じて、フィールド内のカンマやダブルクォート、改行文字などを適切にエスケープし、ダブルクォートで囲む処理を自動的に行います。
    *   書き込み中にエラーが発生した場合、そのエラーを返します。

2.  **`WriteAll(records [][]string) error`**:
    *   複数のレコード（文字列のスライスのスライス `[][]string`）をまとめて書き込みます。
    *   内部的には、各レコードに対して `Write` を呼び出し、最後に `Flush` を呼び出します。
    *   `WriteAll` を使った場合は、通常、**別途 `Flush()` を呼び出す必要はありません**（ただし、エラーが発生した場合は `Flush` が呼ばれない可能性があるので注意が必要です）。

## `Flush()` メソッドの重要性

**`Flush() error`**: `*csv.Writer` は内部でバッファリングを行っているため、`Write` メソッドで書き込んだデータはすぐには基底の `io.Writer` に書き込まれません。`Flush()` を呼び出すことで、バッファに残っているデータが実際に書き込まれます。

**重要:** `Write` メソッドを使ってレコードを書き込んだ場合は、**最後に必ず `Flush()` を呼び出す**必要があります。これを忘れると、データの一部または全部が書き込まれない可能性があります。`WriteAll` を使った場合は通常不要ですが、エラーハンドリングを考慮すると `defer writer.Flush()` を書いておくのが安全な場合もあります（ただし、`Flush` のエラーハンドリングも必要になります）。

## ライターのオプション設定

`*csv.Writer` のフィールドを設定することで、出力するCSVのフォーマットに関するオプションを変更できます。

*   `Comma rune`: フィールドの区切り文字を指定します（デフォルトは `,`）。
*   `UseCRLF bool`: `true` にすると、行末の改行コードとして `\r\n` (CRLF) を使います（デフォルトは `false` で `\n` (LF) を使う）。Windows環境向けのCSVを作成する場合などに設定します。

## コード例

```go title="encoding/csv による CSV データの書き込み"
package main

import (
	"bytes"        // bytes.Buffer を使うため
	"encoding/csv" // csv パッケージをインポート
	"fmt"
	"log"
	"os"
)

func main() {
	// 書き込むデータ (文字列のスライスのスライス)
	records := [][]string{
		{"名前", "年齢", "所属"}, // ヘッダー
		{"田中 太郎", "28", "開発部"},
		{"Suzuki, Hanako", "31", "営業部"}, // カンマを含むデータ
		{"佐藤 次郎", "45", "人事部\n(兼務)"}, // 改行を含むデータ
	}

	// --- ファイルへの書き込み ---
	fmt.Println("--- ファイルへの書き込み ---")
	fileName := "output.csv"
	file, err := os.Create(fileName)
	if err != nil { log.Fatalf("ファイル作成失敗: %v", err) }

	// 1. Writer を作成 (ファイルへ書き込む)
	writer1 := csv.NewWriter(file)
	// writer1.Comma = '\t' // TSV形式で書き出す場合
	// writer1.UseCRLF = true // 改行コードを CRLF にする場合

	// 2a. WriteAll で一括書き込み
	// err = writer1.WriteAll(records)
	// if err != nil { log.Fatalf("WriteAll 失敗: %v", err) }
	// WriteAll は内部で Flush するので、通常は Flush 不要

	// 2b. Write で1レコードずつ書き込み
	for _, record := range records {
		err := writer1.Write(record)
		if err != nil {
			log.Fatalf("Write 失敗 (record: %v): %v", record, err)
		}
	}

	// 3. ★ Flush を呼び出してバッファの内容をファイルに書き出す ★
	// Write を使った場合は Flush が必須！
	writer1.Flush()
	// Flush 時にエラーが発生する可能性もある
	if err := writer1.Error(); err != nil {
		log.Fatalf("Flush 後のエラーチェック: %v", err)
	}

	file.Close() // ファイルを閉じる
	fmt.Printf("ファイル '%s' に書き込みました。\n", fileName)

	// 書き込んだ内容を確認
	content, _ := os.ReadFile(fileName)
	fmt.Println("\n--- 書き込んだファイルの内容 ---")
	fmt.Print(string(content))
	fmt.Println("-------------------------")


	// --- メモリバッファへの書き込み ---
	fmt.Println("\n--- メモリバッファへの書き込み ---")
	var buffer bytes.Buffer
	writer2 := csv.NewWriter(&buffer) // Writer として *bytes.Buffer を渡す

	// WriteAll を使う例
	err = writer2.WriteAll(records)
	if err != nil { log.Fatalf("WriteAll (Buffer) 失敗: %v", err) }
	// WriteAll は Flush するので不要: writer2.Flush()

	fmt.Println("メモリバッファへの書き込み完了。")
	fmt.Println("\n--- バッファの内容 ---")
	fmt.Print(buffer.String())
	fmt.Println("--------------------")


	// --- 後片付け ---
	os.Remove(fileName)
}

/* 実行結果:
--- ファイルへの書き込み ---
ファイル 'output.csv' に書き込みました。

--- 書き込んだファイルの内容 ---
名前,年齢,所属
"田中 太郎",28,開発部
"Suzuki, Hanako",31,営業部
"佐藤 次郎",45,"人事部
(兼務)"
-------------------------

--- メモリバッファへの書き込み ---
メモリバッファへの書き込み完了。

--- バッファの内容 ---
名前,年齢,所属
"田中 太郎",28,開発部
"Suzuki, Hanako",31,営業部
"佐藤 次郎",45,"人事部
(兼務)"
--------------------
*/
```

**コード解説:**

*   `csv.NewWriter(file)`: ファイル `file` に書き込むための `*csv.Writer` を作成します。
*   `writer1.Write(record)`: ループ内で各レコード (`[]string`) を書き込みます。`"Suzuki, Hanako"` や `"人事部\n(兼務)"` のように、カンマや改行を含むフィールドは自動的にダブルクォートで囲まれます。
*   `writer1.Flush()`: ループで `Write` を使って書き込んだ後、**必ず `Flush()` を呼び出して**バッファの内容をファイルに書き込みます。
*   `writer1.Error()`: `Flush` 後にエラーが発生していないかを確認します。
*   `csv.NewWriter(&buffer)`: `io.Writer` としてメモリバッファ (`*bytes.Buffer`) を指定することもできます。
*   `writer2.WriteAll(records)`: 複数のレコードを一度に書き込みます。この場合、通常 `Flush` は不要です。

`encoding/csv` パッケージを使うことで、CSVのフォーマット（クォーティング、エスケープなど）を気にすることなく、簡単にデータをCSV形式で出力できます。`Write` を使う場合は `Flush()` を忘れないようにしましょう。