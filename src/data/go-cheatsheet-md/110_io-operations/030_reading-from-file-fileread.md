---
title: "I/O 操作: ファイルからの読み込み (`file.Read`)"
tags: ["io-operations", "io", "os", "file", "read", "Reader", "EOF", "ファイル読み込み", "バッファ", "ループ"]
---

`os.ReadFile` はファイル全体を一度に読み込みますが、大きなファイルを扱いたい場合や、データを少しずつ処理したい場合は、ファイルを開いてから **`Read`** メソッドを使って部分的に読み込む必要があります。

`os.Open` や `os.OpenFile` で取得した `*os.File` は `io.Reader` インターフェースを満たしており、`Read` メソッドを持っています。

## `file.Read()` の使い方

`Read` メソッドは、ファイルからデータを読み込み、引数として渡されたバイトスライス `p` に格納します。

**シグネチャ:** `func (f *File) Read(p []byte) (n int, err error)`

*   `p`: 読み込んだデータを格納するためのバイトスライス（バッファ）。
*   戻り値:
    *   `n`: 実際に読み込まれて `p` に格納されたバイト数。
    *   `err`: 読み込み中に発生したエラー。
        *   **`io.EOF`**: ファイルの**終端**に達した場合に返される**特別なエラー値**です。これは通常、エラー状態ではなく、読み込みが正常に完了したことを示します。
        *   その他のエラー: 読み込み中に問題が発生した場合（例: ディスクエラー）。

**一般的な読み込みループ:**

ファイルの内容をすべて読み込むには、通常 `for` ループの中で `Read` を繰り返し呼び出します。

1.  固定サイズのバッファ（例: `make([]byte, 4096)`）を用意します。
2.  ループ内で `file.Read(buffer)` を呼び出します。
3.  返されたバイト数 `n` が `0` より大きい場合、`buffer[:n]` の部分が有効なデータなので、それを処理します（例: 別の `io.Writer` に書き出す、データとして蓄積する）。
4.  返されたエラー `err` をチェックします。
    *   `err == io.EOF` であれば、ファイルの終端に達したのでループを終了します。
    *   `err != nil` でかつ `err != io.EOF` であれば、何らかの読み込みエラーが発生したので、エラー処理を行いループを終了します。
    *   `err == nil` であれば、まだ読み込むデータが残っている可能性があるのでループを続行します。

## コード例

```go title="file.Read を使ったファイル読み込み"
package main

import (
	"fmt"
	"io" // io.EOF を使うため
	"log"
	"os"
)

func main() {
	// --- テスト用ファイルの準備 ---
	fileName := "example_read_loop.txt"
	fileContent := "Line 1: Hello, Go!\nLine 2: Reading data in chunks.\nLine 3: End of file."
	err := os.WriteFile(fileName, []byte(fileContent), 0644)
	if err != nil {
		log.Fatalf("テストファイルの書き込みに失敗: %v", err)
	}
	fmt.Printf("テストファイル '%s' を作成しました。\n\n", fileName)

	// --- ファイルを開く ---
	file, err := os.Open(fileName)
	if err != nil {
		log.Fatalf("ファイルオープン失敗: %v", err)
	}
	// ★ defer でファイルを確実に閉じる ★
	defer file.Close()

	// --- ループでファイルを読み込む ---
	buffer := make([]byte, 32) // 32バイトのバッファを用意
	totalBytesRead := 0
	fmt.Println("--- ファイル内容 (チャンクごと) ---")

	for {
		// バッファにデータを読み込む
		bytesRead, err := file.Read(buffer)
		totalBytesRead += bytesRead

		if bytesRead > 0 {
			// 実際に読み込んだ部分 (buffer[:bytesRead]) を処理する
			// ここでは文字列に変換して表示
			fmt.Printf("読み込み (%d bytes): %s\n", bytesRead, string(buffer[:bytesRead]))
		}

		// ★ エラーチェック ★
		if err != nil {
			if err == io.EOF {
				// ファイルの終端に達した場合は正常終了
				fmt.Println("--- ファイル終端 (EOF) ---")
				break // ループを抜ける
			}
			// EOF 以外のエラーが発生した場合
			log.Fatalf("読み込みエラー: %v", err)
			break // (Fatalf なので不要だが念のため)
		}
		// err == nil ならループを続ける
	}

	fmt.Printf("\n合計 %d バイト読み込みました。\n", totalBytesRead)

	// --- 後片付け ---
	err = os.Remove(fileName)
	if err != nil {
		log.Printf("警告: テストファイルの削除に失敗: %v", err)
	}
}

/* 実行結果:
テストファイル 'example_read_loop.txt' を作成しました。

--- ファイル内容 (チャンクごと) ---
読み込み (32 bytes): Line 1: Hello, Go!
Line 2: Readi
読み込み (32 bytes): ng data in chunks.
Line 3: End o
読み込み (10 bytes): f file.
--- ファイル終端 (EOF) ---

合計 74 バイト読み込みました。
*/
```

**コード解説:**

*   `buffer := make([]byte, 32)`: 32バイトのバッファを作成します。
*   `for { ... }`: 無限ループで `Read` を呼び出し続けます。
*   `bytesRead, err := file.Read(buffer)`: ファイルから最大32バイトを `buffer` に読み込みます。`bytesRead` に実際に読み込んだバイト数、`err` にエラー情報が入ります。
*   `if bytesRead > 0 { ... }`: 実際にデータが読み込めた場合のみ、その部分 `buffer[:bytesRead]` を処理します。
*   `if err != nil { ... }`: エラーチェックを行います。
    *   `if err == io.EOF`: ファイルの終端に達したら、ループを `break` します。**`io.EOF` はエラーとして処理するのではなく、ループ終了の合図として扱います**。
    *   それ以外のエラー (`err != nil && err != io.EOF`) があれば、`log.Fatalf` でプログラムを終了させています。

`file.Read` をループで使う方法は、ファイルサイズに関わらず、メモリ使用量を抑えながらファイルを処理するための基本的な方法です。より便利な方法として、`bufio` パッケージの `Scanner` や `Reader` があります（後のセクションで説明します）。