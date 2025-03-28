---
title: "I/O 操作: バッファ付きスキャナー (`bufio.Scanner`)"
tags: ["io-operations", "io", "bufio", "Scanner", "NewScanner", "Scan", "Text", "Err", "Split", "ファイル読み込み", "行単位"]
---

テキストファイルを行単位で読み込んだり、空白で区切られた単語ごとに読み込んだりする場合、`bufio.Reader` の `ReadString` などを使うよりも、**`bufio.Scanner`** を使う方がより簡単で便利なことがあります。

`Scanner` は、`io.Reader` からの入力を受け取り、それを一連の「トークン」（デフォルトでは改行で区切られた行）に分割して、簡単に反復処理できるようにします。

`import "bufio"` として利用します。

## `bufio.Scanner` の使い方

1.  **`bufio.NewScanner(r io.Reader)`**: `io.Reader` (`*os.File` など) を引数として、新しい `*bufio.Scanner` を作成します。
2.  **`for scanner.Scan() { ... }`**: `Scan()` メソッドをループの条件として使います。
    *   `Scan()` は、次のトークンに進みます。成功すれば `true` を、これ以上トークンがない（EOF またはエラー）場合は `false` を返します。
    *   ループは、`Scan()` が `false` を返すまで続きます。
3.  **`scanner.Text()` または `scanner.Bytes()`**: ループ内で、`Scan()` によって読み込まれた最新のトークンを `string` または `[]byte` として取得します。
4.  **`scanner.Err() error`**: **ループが終了した後**、`Scan()` が `false` を返した原因が `io.EOF` 以外のエラーであったかどうかを確認するために、`Err()` メソッドを呼び出します。エラーが発生していなければ `nil` を返します。**このエラーチェックは非常に重要です。**

## コード例: ファイルを行単位で読み込む

```go title="bufio.Scanner でファイルを行単位で読み込む"
package main

import (
	"bufio" // bufio.Scanner を使うため
	"fmt"
	"log"
	"os"
	"strings" // strings.NewReader の例のため
)

func main() {
	// --- ファイルを行単位で読み込む ---
	fmt.Println("--- ファイルを行単位で読み込み ---")
	fileName := "example_scanner.txt"
	fileContent := "これは一行目。\nそして二行目。\n\n四行目（間に空行）。\n"
	err := os.WriteFile(fileName, []byte(fileContent), 0644)
	if err != nil { log.Fatalf("テストファイルの書き込み失敗: %v", err) }

	file, err := os.Open(fileName)
	if err != nil { log.Fatalf("ファイルオープン失敗: %v", err) }
	defer file.Close()

	// 1. Scanner を作成
	scanner := bufio.NewScanner(file)

	// 2. for scanner.Scan() ループで反復処理
	lineNumber := 1
	for scanner.Scan() {
		// 3. scanner.Text() で現在の行 (トークン) を取得
		line := scanner.Text() // 末尾の改行文字は含まれない
		fmt.Printf("%d: %s\n", lineNumber, line)
		lineNumber++
	}

	// 4. ★ ループ終了後、必ずエラーをチェック ★
	if err := scanner.Err(); err != nil {
		// 読み込み中に I/O エラーなどが発生した場合
		log.Fatalf("スキャン中にエラー発生: %v", err)
	}
	fmt.Println("ファイルのスキャン完了。")


	// --- 文字列を単語単位で読み込む ---
	fmt.Println("\n--- 文字列を単語単位で読み込み ---")
	input := "Now is the time for all good gophers"
	wordScanner := bufio.NewScanner(strings.NewReader(input))

	// ★ Split 関数を設定してトークンの分割方法を変更 ★
	// bufio.ScanWords は空白文字で区切られた単語ごとに分割する
	wordScanner.Split(bufio.ScanWords)

	wordCount := 0
	for wordScanner.Scan() {
		word := wordScanner.Text()
		fmt.Printf("単語 %d: %s\n", wordCount+1, word)
		wordCount++
	}
	if err := wordScanner.Err(); err != nil {
		log.Fatalf("単語スキャン中にエラー発生: %v", err)
	}
	fmt.Printf("合計 %d 単語をスキャンしました。\n", wordCount)


	// --- 後片付け ---
	os.Remove(fileName)
}

/* 実行結果:
--- ファイルを行単位で読み込み ---
1: これは一行目。
2: そして二行目。
3:
4: 四行目（間に空行）。
ファイルのスキャン完了。

--- 文字列を単語単位で読み込み ---
単語 1: Now
単語 2: is
単語 3: the
単語 4: time
単語 5: for
単語 6: all
単語 7: good
単語 8: gophers
合計 8 単語をスキャンしました。
*/
```

**コード解説:**

*   **行単位読み込み:**
    *   `scanner := bufio.NewScanner(file)`: ファイルから読み取る Scanner を作成します。デフォルトでは改行 (`\n`) で分割します。
    *   `for scanner.Scan()`: 次の行があれば `true` を返し、ループが続行されます。EOF に達すると `false` を返してループが終了します。
    *   `line := scanner.Text()`: `Scan()` で読み込まれた行の内容を文字列として取得します。**`Text()` が返す文字列には末尾の改行文字は含まれません**。
    *   `if err := scanner.Err(); err != nil`: ループ終了後、`Scan()` が `false` を返した原因が EOF 以外のエラー（例: I/O エラー）でないかを確認します。
*   **単語単位読み込み:**
    *   `wordScanner := bufio.NewScanner(strings.NewReader(input))`: 文字列から読み取る Scanner を作成します。
    *   `wordScanner.Split(bufio.ScanWords)`: Scanner の分割方法を、デフォルトの行単位 (`bufio.ScanLines`) から単語単位 (`bufio.ScanWords`) に変更します。`bufio.ScanWords` は一つ以上の空白文字で区切られた部分をトークンとみなします。
    *   ループ処理は行単位の場合と同様です。

`bufio.Scanner` は、テキストデータを特定の区切り文字（デフォルトは改行）で分割しながら処理する場合に、`bufio.Reader` の `ReadString` などを使うよりもシンプルでメモリ効率が良いことが多いです。特に、一行が非常に長い可能性がある場合でも、内部バッファを適切に管理してくれる利点があります。ループ後の `scanner.Err()` によるエラーチェックを忘れないようにしましょう。