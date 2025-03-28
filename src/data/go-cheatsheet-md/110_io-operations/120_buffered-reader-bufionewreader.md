---
title: "I/O 操作: バッファ付きリーダー (`bufio.NewReader`)"
tags: ["io-operations", "io", "bufio", "Reader", "NewReader", "バッファリング", "効率化", "ReadString", "ReadByte"]
---

`io.Reader` からデータを読み込む際、特に `Read` メソッドで一度に少しずつ（例えば数バイトずつ）読み込む場合、システムコールが頻繁に発生し、パフォーマンスが低下することがあります。このような場合に、**バッファリング (Buffering)** を行うことで I/O 効率を改善できます。

`bufio` パッケージの **`NewReader`** 関数は、既存の `io.Reader` をラップし、内部にバッファを持つ新しい `io.Reader` (`*bufio.Reader`) を作成します。

`import "bufio"` として利用します。

## `bufio.NewReader()` の使い方

`bufio.NewReader()` は、引数として元の `io.Reader` を受け取ります。

**構文:** `reader := bufio.NewReader(rd io.Reader)`

*   `rd`: バッファリングしたい元の `io.Reader`（例: `*os.File`, `strings.Reader` など）。
*   戻り値 `reader`: `*bufio.Reader` 型のポインタ。これも `io.Reader` インターフェースを満たします。
*   デフォルトでは、`bufio.Reader` は 4096 バイトのバッファを持ちます。`bufio.NewReaderSize(rd, size)` を使うとバッファサイズを指定できます。

`*bufio.Reader` は、元の `rd` からデータを読み込む際、要求されたサイズよりも多めに（バッファサイズまで）データを先読みして内部バッファに保持します。後続の読み込み要求は、まず内部バッファからデータを提供しようとするため、元の `rd` への実際の読み込み回数を減らすことができます。

## `*bufio.Reader` の便利なメソッド

`*bufio.Reader` は標準の `Read` メソッドに加えて、より便利な読み込みメソッドを提供します。

*   **`ReadByte() (byte, error)`**: 1バイト読み込んで返します。
*   **`ReadRune() (r rune, size int, err error)`**: UTF-8 エンコードされた1文字 (rune) を読み込んで返します。
*   **`ReadString(delim byte) (string, error)`**: 指定された区切り文字 `delim`（例: `'\n'`）が見つかるまで、またはエラーが発生するまで読み込み、区切り文字を含む文字列を返します。
*   **`ReadLine() (line []byte, isPrefix bool, err error)`**: 1行を読み込みます（`\n` または `\r\n` まで）。行が長すぎてバッファに収まらない場合、`isPrefix` が `true` になります。通常は `ReadString('\n')` や `bufio.Scanner` の方が使いやすいです。
*   **`Peek(n int) ([]byte, error)`**: 次に読み込まれる `n` バイト分のデータを、リーダーの内部状態を進めずに**覗き見**します。

## コード例: ファイルを行単位で読み込む

`bufio.NewReader` と `ReadString('\n')` を使ってファイルを行単位で読み込む例です。

```go title="bufio.Reader でファイルを行単位で読み込む"
package main

import (
	"bufio" // bufio パッケージをインポート
	"fmt"
	"io" // io.EOF を使うため
	"log"
	"os"
)

func main() {
	// --- テスト用ファイルの準備 ---
	fileName := "example_buffered.txt"
	fileContent := "第一行目です。\nSecond line here.\n行番号３。\n最後の行。\n"
	err := os.WriteFile(fileName, []byte(fileContent), 0644)
	if err != nil { log.Fatalf("テストファイルの書き込み失敗: %v", err) }
	fmt.Printf("テストファイル '%s' を作成しました。\n\n", fileName)

	// --- ファイルを開く ---
	file, err := os.Open(fileName)
	if err != nil { log.Fatalf("ファイルオープン失敗: %v", err) }
	defer file.Close()

	// --- bufio.NewReader でラップ ---
	reader := bufio.NewReader(file) // file (io.Reader) をラップ

	fmt.Println("--- ファイル内容 (行単位) ---")
	lineNumber := 1
	for {
		// ★ ReadString('\n') で改行まで読み込む ★
		// (改行文字自体も返される文字列に含まれる)
		line, err := reader.ReadString('\n')

		if len(line) > 0 {
			// 読み込んだ行を処理 (ここでは表示)
			// strings.TrimSuffix(line, "\n") で末尾の改行を削除できる
			fmt.Printf("%d: %s", lineNumber, line)
			lineNumber++
		}

		// ★ エラーチェック ★
		if err != nil {
			if err == io.EOF {
				// ファイル終端に到達したら正常終了
				fmt.Println("--- ファイル終端 (EOF) ---")
				break
			}
			// EOF 以外のエラー
			log.Fatalf("読み込みエラー: %v", err)
		}
	}

	// --- 後片付け ---
	err = os.Remove(fileName)
	if err != nil { log.Printf("警告: テストファイルの削除に失敗: %v", err) }
}

/* 実行結果:
テストファイル 'example_buffered.txt' を作成しました。

--- ファイル内容 (行単位) ---
1: 第一行目です。
2: Second line here.
3: 行番号３。
4: 最後の行。
--- ファイル終端 (EOF) ---
*/
```

**コード解説:**

*   `reader := bufio.NewReader(file)`: 開いたファイル `file` を `bufio.Reader` でラップします。
*   `for { ... }`: ループでファイル終端まで読み込みます。
*   `line, err := reader.ReadString('\n')`: `reader` から次の改行文字 (`\n`) までを読み込み、`line` に格納します。`line` には改行文字自体も含まれます。
*   `if len(line) > 0 { ... }`: 読み込んだ行があれば表示します。EOF に達した最後の `ReadString` 呼び出しでも、改行で終わらない最後の部分が返されることがあるため、このチェックを入れています。
*   `if err != nil { ... }`: エラーチェックを行います。`io.EOF` は正常な終了として `break` します。

`bufio.Reader` は、特に `ReadString` や `ReadBytes` のように区切り文字ベースで読み込みたい場合や、`Peek` で先読みしたい場合、あるいは多数の小さな `Read` 呼び出しを行う場合に、パフォーマンスを向上させるのに役立ちます。行単位の読み込みには、次に説明する `bufio.Scanner` がさらに便利な場合もあります。