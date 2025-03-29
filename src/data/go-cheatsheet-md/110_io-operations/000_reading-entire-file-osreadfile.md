## タイトル
title: ファイル全体を読み込む (`os.ReadFile`)

## タグ
tags: ["io-operations", "io", "os", "file", "read", "ReadFile", "ファイル読み込み"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os" // os パッケージ
)

func main() {
	fileName := "example.txt" // 読み込むファイル名
	// 事前にファイルを作成しておく必要があります
	// os.WriteFile(fileName, []byte("ファイル内容"), 0644)

	fmt.Printf("'%s' を読み込み中...\n", fileName)
	// os.ReadFile でファイル全体をバイトスライスに読み込む
	data, err := os.ReadFile(fileName)

	// エラーチェックは必須
	if err != nil {
		log.Fatalf("読み込み失敗: %v", err)
	}

	// 読み込んだ内容 (バイトスライス) を文字列に変換して表示
	fmt.Println("--- 内容 ---")
	fmt.Print(string(data))
	fmt.Println("------------")
	fmt.Printf("バイト数: %d\n", len(data))

	// os.Remove(fileName) // 後片付け
}

```

## 解説
```text
ファイルの内容を**一度にすべて**メモリに読み込む最も簡単な方法は、
`os` パッケージの **`ReadFile`** 関数 (Go 1.16+) を使うことです。
`import "os"` で利用します。

**使い方:**
`data, err := os.ReadFile(filename string)`
*   `filename`: 読み込むファイル名 (パス)。
*   `data`: ファイル内容が格納されたバイトスライス (`[]byte`)。
*   `err`: エラー情報 (成功時は `nil`)。
ファイルのオープン、読み込み、クローズは自動で行われます。

コード例では、`os.ReadFile` で `example.txt` を読み込み、
エラーチェック後、バイトスライス `data` を `string()` で
文字列に変換して表示しています。

**注意点:**
*   **メモリ使用量:** ファイル全体をメモリに読み込むため、
    **巨大なファイル**には適していません。メモリ不足になる
    可能性があります。
*   **大きなファイル:** 大きなファイルは `os.Open` で開き、
    バッファを使って少しずつ読み込む (`file.Read` や
    `bufio.Scanner` など) のが効率的です (後述)。

`os.ReadFile` は比較的小さな設定ファイルやテキストファイルの
読み込みに便利な関数です。