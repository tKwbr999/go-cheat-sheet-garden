---
title: "I/O 操作: CSV データの読み込み (`encoding/csv`)"
tags: ["io-operations", "encoding/csv", "csv", "Reader", "ReadAll", "Read", "ファイル読み込み", "データ解析"]
---

CSV (Comma-Separated Values) は、データをカンマ (`,`) で区切って表現するシンプルなテキスト形式で、スプレッドシートやデータベースとのデータ交換によく使われます。Goの標準ライブラリ **`encoding/csv`** パッケージは、CSVデータの読み書きを簡単に行うための機能を提供します。

`import "encoding/csv"` として利用します。

## CSVリーダーの作成: `csv.NewReader()`

CSVデータを読み込むには、まず `csv.NewReader()` を使って `*csv.Reader` を作成します。この関数は `io.Reader` を引数に取ります。

**構文:** `reader := csv.NewReader(r io.Reader)`

*   `r`: CSVデータが含まれる `io.Reader`（例: `*os.File`, `strings.Reader` など）。
*   戻り値 `reader`: `*csv.Reader` 型のポインタ。

## CSVデータの読み込み方法

`*csv.Reader` を使ってデータを読み込む主な方法は2つあります。

1.  **`ReadAll() ([][]string, error)`**:
    *   Reader から**すべてのレコード**を一度に読み込み、`[][]string`（文字列のスライスのスライス）として返します。
    *   外側のスライスが各行（レコード）を表し、内側のスライスがその行の各フィールド（カラム）を表します。
    *   ファイル全体をメモリに読み込むため、非常に大きなCSVファイルには不向きな場合があります。
    *   読み込み中にエラーが発生した場合、そのエラーを返します。

2.  **`Read() ([]string, error)`**:
    *   Reader から**1レコード（1行）**を読み込み、`[]string`（文字列スライス）として返します。各要素がその行のフィールドに対応します。
    *   ファイルの終端に達すると `io.EOF` エラーを返します。
    *   通常、`for` ループの中で繰り返し呼び出し、`io.EOF` が返されるまで処理します。大きなファイルに適しています。

## リーダーのオプション設定

`*csv.Reader` のフィールドを設定することで、CSVのフォーマットに関するオプションを変更できます。

*   `Comma rune`: フィールドの区切り文字を指定します（デフォルトは `,`）。タブ区切り (TSV) の場合は `'\t'` を指定します。
*   `Comment rune`: コメント行を示す文字を指定します。この文字で始まる行は無視されます（デフォルトではコメント機能は無効）。
*   `FieldsPerRecord int`: 各レコードが持つべきフィールド数を指定します。`0` (デフォルト) の場合は、最初のレコードのフィールド数が期待値となります。レコードごとにフィールド数が異なる場合はエラーになります。可変長の場合は負の値を設定します。
*   `LazyQuotes bool`: `true` にすると、クォート (`"`) の扱いがより緩やかになります。
*   `TrimLeadingSpace bool`: `true` にすると、各フィールドの先頭の空白文字が自動的にトリムされます。

## コード例

```go title="encoding/csv による CSV データの読み込み"
package main

import (
	"encoding/csv" // csv パッケージをインポート
	"fmt"
	"io" // io.EOF を使うため
	"log"
	"os"
	"strings" // strings.NewReader を使うため
)

func main() {
	// --- サンプル CSV データ (文字列) ---
	csvData := `Name,Age,City
"Alice",30,"New York"
"Bob",24,"London"
"Charlie",,San Francisco` // Age が空

	// --- ReadAll() を使って全レコードを読み込む ---
	fmt.Println("--- ReadAll() ---")
	reader1 := csv.NewReader(strings.NewReader(csvData))
	// reader1.Comma = ';' // 区切り文字がセミコロンの場合など
	// reader1.Comment = '#' // '#' で始まる行をコメントとして無視する場合

	allRecords, err := reader1.ReadAll()
	if err != nil {
		log.Fatalf("ReadAll 失敗: %v", err)
	}

	// 読み込んだレコードを表示 (allRecords は [][]string)
	for i, record := range allRecords {
		fmt.Printf("レコード %d: %v (フィールド数: %d)\n", i, record, len(record))
		// record は []string
		// for j, field := range record { ... } のように個々のフィールドにアクセス可能
	}

	// --- Read() を使って1レコードずつ読み込む ---
	fmt.Println("\n--- Read() in loop ---")
	reader2 := csv.NewReader(strings.NewReader(csvData))
	// ヘッダー行を読み飛ばす場合 (オプション)
	_, _ = reader2.Read() // 最初の Read() 呼び出し

	recordNumber := 1
	for {
		// 1レコード読み込む
		record, err := reader2.Read()
		if err != nil {
			if err == io.EOF {
				// ファイル終端ならループ終了
				break
			}
			// EOF 以外のエラー
			log.Fatalf("Read 失敗: %v", err)
		}
		// 読み込んだレコードを処理
		fmt.Printf("データレコード %d: %v\n", recordNumber, record)
		if len(record) >= 3 { // フィールド数を確認
			fmt.Printf("  Name: %s, Age: %s, City: %s\n", record[0], record[1], record[2])
		}
		recordNumber++
	}
	fmt.Println("ループによる読み込み完了。")

}

/* 実行結果:
--- ReadAll() ---
レコード 0: [Name Age City] (フィールド数: 3)
レコード 1: [Alice 30 New York] (フィールド数: 3)
レコード 2: [Bob 24 London] (フィールド数: 3)
レコード 3: [Charlie  San Francisco] (フィールド数: 3)

--- Read() in loop ---
データレコード 1: [Alice 30 New York]
  Name: Alice, Age: 30, City: New York
データレコード 2: [Bob 24 London]
  Name: Bob, Age: 24, City: London
データレコード 3: [Charlie  San Francisco]
  Name: Charlie, Age: , City: San Francisco
ループによる読み込み完了。
*/
```

**コード解説:**

*   `csv.NewReader(strings.NewReader(csvData))`: 文字列 `csvData` から `io.Reader` を作成し、それを基に `*csv.Reader` を作成します。ファイルから読み込む場合は `os.Open` で開いた `*os.File` を渡します。
*   **`ReadAll()`:** `reader1.ReadAll()` は CSV 全体を `[][]string` として返します。ヘッダー行も含まれます。
*   **`Read()` ループ:**
    *   `reader2.Read()` をループ内で呼び出します。
    *   `err == io.EOF` をチェックしてループを終了します。
    *   `record` は `[]string` で、各要素がその行のフィールドを表します。例では `record[0]` (Name), `record[1]` (Age), `record[2]` (City) にアクセスしています。
    *   空のフィールド（例: Charlie の Age）は空文字列 `""` として読み込まれます。

`encoding/csv` パッケージは、CSVデータの読み込み（および書き込み）を簡単かつ効率的に行うための標準的な方法を提供します。大きなファイルを扱う場合は `Read()` を使ったループ処理が推奨されます。