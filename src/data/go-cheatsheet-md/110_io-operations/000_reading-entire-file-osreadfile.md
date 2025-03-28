---
title: "I/O 操作: ファイル全体を読み込む (`os.ReadFile`)"
tags: ["io-operations", "io", "os", "file", "read", "ReadFile", "ファイル読み込み"]
---

ファイルの内容を**一度にすべて**メモリに読み込みたい場合、最も簡単な方法は `os` パッケージの **`ReadFile`** 関数を使うことです。これは Go 1.16 で導入されました（それ以前は `io/ioutil` パッケージの `ReadFile` が使われていました）。

`import "os"` として利用します。

## `os.ReadFile()` の使い方

`os.ReadFile()` は、引数で指定されたファイル名のファイルを開き、その内容すべてを読み込んでバイトスライス (`[]byte`) として返します。ファイルのオープン、読み込み、クローズは関数内部で自動的に行われます。

**構文:** `data, err := os.ReadFile(filename string)`

*   `filename`: 読み込むファイルの名前（パス）。
*   戻り値:
    *   `data`: ファイルの内容が格納されたバイトスライス (`[]byte`)。
    *   `err`: ファイルのオープンや読み込み中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

## コード例

```go title="os.ReadFile の使用例"
package main

import (
	"fmt"
	"log"
	"os" // os パッケージをインポート
)

func main() {
	// --- テスト用ファイルの準備 ---
	fileName := "example_read.txt"
	fileContent := "これはファイルの内容です。\n複数行のテキスト。\nGo言語の os.ReadFile のテスト。\n"
	// os.WriteFile でテストファイルを作成 (次のセクションで説明)
	err := os.WriteFile(fileName, []byte(fileContent), 0644) // 権限 0644
	if err != nil {
		log.Fatalf("テストファイルの書き込みに失敗: %v", err)
	}
	fmt.Printf("テストファイル '%s' を作成しました。\n\n", fileName)

	// --- os.ReadFile でファイル全体を読み込む ---
	fmt.Printf("'%s' を読み込み中...\n", fileName)
	data, err := os.ReadFile(fileName) // ファイル名を指定して読み込み

	// ★ エラーチェック ★
	if err != nil {
		// ファイルが存在しない、権限がないなどの場合にエラーになる
		log.Fatalf("ファイルの読み込みに失敗: %v", err)
	}

	// --- 読み込んだ内容の利用 ---
	// data は []byte 型なので、文字列として表示する場合は string() で変換
	fmt.Println("--- ファイルの内容 ---")
	fmt.Print(string(data)) // Print を使うと末尾の改行もそのまま表示される
	fmt.Println("--------------------")
	fmt.Printf("読み込んだバイト数: %d\n", len(data))

	// --- 後片付け ---
	err = os.Remove(fileName)
	if err != nil {
		log.Printf("警告: テストファイルの削除に失敗: %v", err)
	}
}

/* 実行結果:
テストファイル 'example_read.txt' を作成しました。

'example_read.txt' を読み込み中...
--- ファイルの内容 ---
これはファイルの内容です。
複数行のテキスト。
Go言語の os.ReadFile のテスト。

--------------------
読み込んだバイト数: 101
*/
```

**コード解説:**

*   `os.WriteFile` でテスト用のファイル `example_read.txt` を作成しています（この関数は次のセクションで説明します）。
*   `data, err := os.ReadFile(fileName)`: `os.ReadFile` を呼び出してファイルの内容を `data` (バイトスライス) に読み込みます。
*   `if err != nil { ... }`: ファイルが存在しない場合や読み取り権限がない場合などに `err` が `nil` 以外になるため、必ずエラーチェックを行います。
*   `fmt.Print(string(data))`: 読み込んだバイトスライス `data` を `string` に変換してコンソールに出力しています。

## 注意点

*   **メモリ使用量:** `os.ReadFile` はファイルの内容**すべて**をメモリ上のバイトスライスに読み込みます。そのため、非常に**大きなファイル**（数GBなど）を読み込もうとすると、大量のメモリを消費し、場合によってはメモリ不足でプログラムがクラッシュする可能性があります。
*   **大きなファイルの扱い:** 大きなファイルを扱う場合は、ファイル全体を一度に読み込むのではなく、`os.Open` でファイルを開き、バッファを使って少しずつ読み込む（`file.Read` や `bufio.Scanner` を使う）方が効率的です（後のセクションで説明します）。

`os.ReadFile` は、比較的小さな設定ファイルやテキストファイルなどを手軽に読み込みたい場合に非常に便利な関数です。