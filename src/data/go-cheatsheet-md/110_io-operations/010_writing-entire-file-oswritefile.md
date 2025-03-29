## タイトル
title: I/O 操作: ファイルへの書き込み (`os.WriteFile`)

## タグ
tags: ["io-operations", "io", "os", "file", "write", "WriteFile", "ファイル書き込み", "パーミッション"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os" // os パッケージ
)

func main() {
	fileName := "output.txt"
	content := "os.WriteFile で書き込むテキスト。\n改行もOK。\n"
	data := []byte(content) // 文字列をバイトスライスに変換

	// os.WriteFile でファイルに書き込む (パーミッション 0644)
	err := os.WriteFile(fileName, data, 0644)

	// エラーチェックは必須
	if err != nil {
		log.Fatalf("書き込み失敗 '%s': %v", fileName, err)
	}

	fmt.Printf("'%s' に書き込み成功。\n", fileName)

	// (確認のため os.ReadFile で読み込む処理は省略)
	// os.Remove(fileName) // 後片付け
}

```

## 解説
```text
バイトスライス (`[]byte`) の内容をファイルに書き込む簡単な方法は、
`os` パッケージの **`WriteFile`** 関数 (Go 1.16+) を使うことです。
`import "os"` で利用します。

**使い方:**
`err := os.WriteFile(filename string, data []byte, perm fs.FileMode)`
*   `filename`: 書き込むファイル名 (パス)。
*   `data`: 書き込むバイトスライス (`[]byte`)。
    文字列は `[]byte("...")` で変換。
*   `perm`: ファイルパーミッション (`fs.FileMode`)。
    通常 8進数リテラルで指定 (例: `0644`, `0600`)。
    *   `0644`: 所有者RW, 他R (一般的)
    *   `0600`: 所有者RWのみ
*   `err`: エラー情報 (成功時は `nil`)。
ファイルのオープン、書き込み、クローズは自動で行われます。

**注意:** 指定ファイルが存在する場合、内容は**上書き**されます。
追記したい場合は `os.OpenFile` を使います (後述)。

コード例では、文字列を `[]byte` に変換し、`os.WriteFile` で
`output.txt` にパーミッション `0644` で書き込んでいます。

`os.WriteFile` はプログラム結果や設定等のファイル保存に便利です。
ただし、ファイル全体を一度に書き込むため、非常に大きなデータを
少しずつ書き込みたい場合には不向きです (その場合は `os.Create` や
`os.OpenFile` を使います)。