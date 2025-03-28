---
title: "I/O 操作: ファイルへの書き込み (`os.WriteFile`)"
tags: ["io-operations", "io", "os", "file", "write", "WriteFile", "ファイル書き込み", "パーミッション"]
---

バイトスライス (`[]byte`) の内容をファイルに書き込みたい場合、最も簡単な方法は `os` パッケージの **`WriteFile`** 関数を使うことです。これも Go 1.16 で導入されました（それ以前は `io/ioutil` パッケージの `WriteFile` が使われていました）。

`import "os"` として利用します。

## `os.WriteFile()` の使い方

`os.WriteFile()` は、指定されたファイル名のファイルを作成（または上書き）し、与えられたバイトスライスの内容を書き込みます。ファイルのオープン、書き込み、クローズは関数内部で自動的に行われます。

**構文:** `err := os.WriteFile(filename string, data []byte, perm fs.FileMode)`

*   `filename`: 書き込むファイルの名前（パス）。
*   `data`: ファイルに書き込む内容のバイトスライス (`[]byte`)。文字列を書き込みたい場合は `[]byte("文字列")` のように変換します。
*   `perm`: ファイルの**パーミッション**（アクセス権）を指定します。`fs.FileMode` 型（実体は `uint32`）で、通常は **8進数リテラル**（例: `0644`, `0600`）で指定します。
    *   `0644`: 所有者は読み書き可能、グループとその他は読み取り専用（一般的なファイルのパーミッション）。
    *   `0600`: 所有者のみ読み書き可能。
    *   `0755`: 所有者は読み書き実行可能、グループとその他は読み取り実行可能（実行可能ファイルやディレクトリでよく使われる）。
*   戻り値 `err`: ファイルの作成や書き込み中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

**注意:** 指定したファイルが既に存在する場合、`os.WriteFile` はその内容を**上書き**します。追記したい場合は `os.OpenFile` を使う必要があります（後のセクションで説明します）。

## コード例

```go title="os.WriteFile の使用例"
package main

import (
	"fmt"
	"log"
	"os" // os パッケージをインポート
)

func main() {
	fileName := "output.txt"
	content := "これは os.WriteFile で書き込まれるテキストです。\n2行目も書けます。\n"
	data := []byte(content) // 書き込むデータをバイトスライスに変換

	// --- os.WriteFile でファイルに書き込む ---
	// パーミッションは 0644 (所有者RW, その他R) を指定
	err := os.WriteFile(fileName, data, 0644)

	// ★ エラーチェック ★
	if err != nil {
		// 書き込み権限がない、ディスク容量不足などの場合にエラーになる
		log.Fatalf("ファイル '%s' への書き込みに失敗: %v", fileName, err)
	}

	fmt.Printf("ファイル '%s' に正常に書き込みました。\n", fileName)

	// --- 確認のため、書き込んだファイルを読み込んでみる ---
	// (os.ReadFile は前のセクションで説明)
	readData, readErr := os.ReadFile(fileName)
	if readErr != nil {
		log.Printf("警告: 書き込んだファイルの読み込みに失敗: %v", readErr)
	} else {
		fmt.Println("\n--- 書き込んだファイルの内容 ---")
		fmt.Print(string(readData))
		fmt.Println("-------------------------")
	}

	// --- 後片付け ---
	err = os.Remove(fileName)
	if err != nil {
		log.Printf("警告: テストファイルの削除に失敗: %v", err)
	}
}

/* 実行結果:
ファイル 'output.txt' に正常に書き込みました。

--- 書き込んだファイルの内容 ---
これは os.WriteFile で書き込まれるテキストです。
2行目も書けます。

-------------------------
*/
```

**コード解説:**

*   `content := "..."`: 書き込みたい文字列を定義します。
*   `data := []byte(content)`: 文字列をバイトスライスに変換します。`os.WriteFile` はバイトスライスを受け取るため、この変換が必要です。
*   `err := os.WriteFile(fileName, data, 0644)`: `os.WriteFile` を呼び出して、`data` の内容を `fileName` に書き込みます。パーミッションとして `0644` を指定しています。
*   `if err != nil { ... }`: 書き込みに失敗した場合のエラーチェックを行います。
*   後半では、書き込みが成功したことを確認するために `os.ReadFile` で再度ファイルを読み込んで内容を表示しています。

`os.WriteFile` は、プログラムの実行結果や設定情報などをファイルとして保存したい場合に、手軽に使える便利な関数です。ただし、ファイル全体を一度に書き込むため、非常に大きなデータを少しずつ書き込みたい場合には不向きです（その場合は `os.Create` や `os.OpenFile` を使います）。