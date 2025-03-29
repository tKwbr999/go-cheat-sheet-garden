## タイトル
title: I/O 操作: バッファ付きスキャナー (`bufio.Scanner`)

## タグ
tags: ["io-operations", "io", "bufio", "Scanner", "NewScanner", "Scan", "Text", "Err", "Split", "ファイル読み込み", "行単位"]

## コード
```go
package main

import (
	"bufio" // bufio.Scanner
	"fmt"
	"log"
	"os"
	// "strings"
)

func main() {
	fileName := "example_scanner.txt" // 事前に作成しておく
	// os.WriteFile(fileName, []byte("Line 1\nLine 2\n"), 0644)

	file, err := os.Open(fileName)
	if err != nil { log.Fatal(err) }
	defer file.Close()

	// Scanner を作成 (デフォルトは行単位でスキャン)
	scanner := bufio.NewScanner(file)

	fmt.Println("--- Reading file line by line ---")
	lineNum := 1
	// for scanner.Scan() ループで反復処理
	for scanner.Scan() {
		// scanner.Text() で現在の行を取得 (改行は含まない)
		line := scanner.Text()
		fmt.Printf("%d: %s\n", lineNum, line)
		lineNum++
	}

	// ★ ループ終了後、必ずエラーをチェック ★
	if err := scanner.Err(); err != nil {
		log.Fatalf("Scan error: %v", err)
	}
	fmt.Println("Scan finished.")
	// os.Remove(fileName) // 後片付け
}

```

## 解説
```text
テキストファイルを行単位や単語単位で読み込む場合、
`bufio.Reader` よりも **`bufio.Scanner`** が便利なことがあります。
`io.Reader` からの入力をトークン (デフォルトは行) に分割し、
簡単に反復処理できます。`import "bufio"` で利用します。

**使い方:**
1. **`bufio.NewScanner(r io.Reader)`**: `io.Reader` から Scanner 作成。
2. **`for scanner.Scan() { ... }`**: ループ条件に `Scan()` を使用。
   *   `Scan()` は次のトークンに進み、成功なら `true`、
       終端(EOF)やエラーなら `false` を返す。
3. **`scanner.Text()` / `scanner.Bytes()`**: ループ内で、
   `Scan()` で読み込まれた最新トークンを `string` / `[]byte` で取得。
   (デフォルトの行スキャンの場合、末尾の改行は含まない)
4. **`scanner.Err() error`**: **ループ終了後**に呼び出し、
   `Scan()` が `false` を返した原因が EOF 以外のエラーか確認。
   **このエラーチェックは重要**です。

コード例では、ファイルを開き `bufio.NewScanner` で Scanner を作成。
`for scanner.Scan()` ループで一行ずつ読み込み、`scanner.Text()` で
内容を取得して表示しています。ループ終了後に `scanner.Err()` で
エラーを確認しています。

**(分割方法の変更)**
`scanner.Split()` メソッドでトークンの分割方法を変更できます。
*   `scanner.Split(bufio.ScanLines)`: 行単位 (デフォルト)。
*   `scanner.Split(bufio.ScanWords)`: 空白文字区切りの単語単位。
*   `scanner.Split(bufio.ScanRunes)`: UTF-8 ルーン (文字) 単位。
*   `scanner.Split(bufio.ScanBytes)`: バイト単位。
*   自作の分割関数 (`bufio.SplitFunc`) を渡すことも可能。

`bufio.Scanner` はテキストデータの分割処理にシンプルで効率的です。
特に一行が非常に長い可能性がある場合も内部バッファを管理してくれます。
ループ後の `Err()` チェックを忘れずに行いましょう。