---
title: "I/O 操作: Reader からすべて読み込む (`io.ReadAll`)"
tags: ["io-operations", "io", "ReadAll", "Reader", "EOF", "メモリ", "ファイル読み込み", "HTTP"]
---

`io.Reader` インターフェースを満たす値（ファイル、ネットワーク接続、文字列リーダー、バイトバッファなど）から、その内容を**すべて**一度に読み込んでバイトスライス (`[]byte`) として取得したい場合、`io` パッケージの **`ReadAll`** 関数が便利です。これは Go 1.16 で導入されました（それ以前は `io/ioutil.ReadAll` が使われていました）。

`import "io"` として利用します。

## `io.ReadAll()` の使い方

`io.ReadAll()` は、引数として渡された `io.Reader` (`r`) から、`io.EOF` が返されるまで（終端に達するまで）すべてのデータを読み込み、それを単一のバイトスライスとして返します。

**構文:** `data, err := io.ReadAll(r Reader)`

*   `r`: データを読み込む元の `io.Reader`。
*   戻り値:
    *   `data`: 読み込まれたすべてのデータが格納されたバイトスライス (`[]byte`)。
    *   `err`: 読み込み中に `io.EOF` **以外**のエラーが発生した場合、そのエラー。成功した場合は `nil`（`io.EOF` は成功とみなされ、`nil` が返ります）。

## コード例

`os.File` や `http.Response.Body`、`strings.Reader` など、様々な `io.Reader` に対して `io.ReadAll` を使う例です。

```go title="io.ReadAll の使用例"
package main

import (
	"fmt"
	"io" // io.ReadAll を使うため
	"log"
	"net/http" // HTTP レスポンスボディの例のため
	"os"
	"strings" // strings.NewReader の例のため
)

func main() {
	// --- 例1: strings.Reader から読み込む ---
	fmt.Println("--- 例1: strings.Reader ---")
	reader1 := strings.NewReader("これは文字列リーダーからのデータです。")
	data1, err1 := io.ReadAll(reader1)
	if err1 != nil {
		log.Printf("ReadAll(reader1) 失敗: %v", err1)
	} else {
		fmt.Printf("読み込み成功 (%d bytes): %s\n", len(data1), string(data1))
	}

	// --- 例2: os.File から読み込む ---
	// (os.ReadFile と似ているが、ファイルを開いて Reader を渡す点が異なる)
	fmt.Println("\n--- 例2: os.File ---")
	fileName := "example_readall.txt"
	os.WriteFile(fileName, []byte("ファイルからのデータ。\n複数行。"), 0644)

	file, err := os.Open(fileName) // io.Reader として開く
	if err != nil {
		log.Printf("os.Open 失敗: %v", err)
	} else {
		defer file.Close() // 必ず閉じる
		data2, err2 := io.ReadAll(file) // file は io.Reader
		if err2 != nil {
			log.Printf("ReadAll(file) 失敗: %v", err2)
		} else {
			fmt.Printf("ファイル読み込み成功 (%d bytes):\n%s", len(data2), string(data2))
		}
	}
	os.Remove(fileName) // 後片付け

	// --- 例3: http.Response.Body から読み込む ---
	fmt.Println("\n--- 例3: http.Response.Body ---")
	resp, err := http.Get("https://example.com") // ダミーリクエスト
	if err != nil {
		log.Printf("http.Get 失敗: %v", err)
	} else {
		// ★★★ resp.Body は io.ReadCloser なので、必ず Close する ★★★
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			// resp.Body は io.Reader
			data3, err3 := io.ReadAll(resp.Body)
			if err3 != nil {
				log.Printf("ReadAll(resp.Body) 失敗: %v", err3)
			} else {
				fmt.Printf("HTTPレスポンスボディ読み込み成功 (%d bytes)\n", len(data3))
				// fmt.Println(string(data3[:200])) // 最初の200バイトだけ表示など
			}
		} else {
			fmt.Printf("HTTPステータスエラー: %s\n", resp.Status)
		}
	}
}

/* 実行結果の例:
--- 例1: strings.Reader ---
読み込み成功 (48 bytes): これは文字列リーダーからのデータです。

--- 例2: os.File ---
ファイル読み込み成功 (35 bytes):
ファイルからのデータ。
複数行。
--- 例3: http.Response.Body ---
HTTPレスポンスボディ読み込み成功 (1256 bytes)
*/
```

**コード解説:**

*   `io.ReadAll` は `io.Reader` インターフェースを受け取るため、`strings.Reader`, `*os.File`, `http.Response.Body` など、`Read` メソッドを持つ様々な型の値を引数として渡すことができます。
*   関数は内部で `Read` を繰り返し呼び出し、読み込んだデータを結合して単一のバイトスライス `data` を返します。
*   エラーチェックは `io.EOF` 以外のエラーが発生した場合に行います。`io.EOF` は正常な終了を示すため、`err` は `nil` になります。
*   `http.Response.Body` のような `io.ReadCloser` は、読み込み後に `Close()` を呼び出す必要があるため、`defer resp.Body.Close()` を忘れないようにします。

## 注意点 (os.ReadFile と同様)

*   **メモリ使用量:** `io.ReadAll` は、`os.ReadFile` と同様に、`Reader` から読み込める**すべてのデータ**をメモリ上のバイトスライスに格納しようとします。そのため、非常に**大きなデータストリーム**（巨大なファイルや終わりのないネットワークストリームなど）に対して使うと、メモリを大量に消費したり、メモリ不足になる可能性があります。
*   **大きなデータの扱い:** サイズが大きい、またはサイズが不明なデータストリームを扱う場合は、`io.Copy` を使って別の `Writer` に直接書き出すか、バッファを使って少しずつ読み込む (`Read` メソッドや `bufio.Scanner` など）方が安全で効率的です。

`io.ReadAll` は、データソースのサイズが比較的小さいことが分かっている場合に、その内容全体を簡単にバイトスライスとして取得するための便利な関数です。