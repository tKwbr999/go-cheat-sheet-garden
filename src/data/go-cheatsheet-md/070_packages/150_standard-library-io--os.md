---
title: "標準ライブラリ: `io` / `os` パッケージ (基本的な入出力とOS機能)"
tags: ["packages", "standard library", "io", "os", "ファイル操作", "入出力", "Reader", "Writer", "defer"]
---

Go言語でファイル操作や標準入出力（コンソールとのやり取り）など、基本的な**入出力 (I/O)** を行う際には、主に **`io`** パッケージと **`os`** パッケージを利用します。

## `io` パッケージ: I/O 抽象化インターフェース

`io` パッケージは、様々な種類のデータストリーム（ファイル、ネットワーク接続、メモリバッファなど）に対する**共通の操作方法**を定義する**インターフェース**を提供します。最も重要なのは以下の2つです。

*   **`io.Reader`**: データを**読み取る**ための `Read` メソッドを定義します。
    ```go
    type Reader interface {
        Read(p []byte) (n int, err error)
    }
    ```
    `Read` メソッドは、データをバイトスライス `p` に読み込み、読み込んだバイト数 `n` とエラー `err` を返します。ストリームの終端に達すると `io.EOF` エラーを返します。

*   **`io.Writer`**: データを**書き込む**ための `Write` メソッドを定義します。
    ```go
    type Writer interface {
        Write(p []byte) (n int, err error)
    }
    ```
    `Write` メソッドは、バイトスライス `p` のデータを書き込み、書き込んだバイト数 `n` とエラー `err` を返します。

これらのインターフェースを使うことで、データの読み書きを行う関数は、具体的なデータソース（ファイルか、ネットワークかなど）を意識せずに、共通の方法で処理を記述できます。

`io` パッケージには、これらのインターフェースを扱うための便利な関数も含まれています（例: `io.Copy`, `io.ReadAll`）。

## `os` パッケージ: OS機能へのアクセス

`os` パッケージは、オペレーティングシステムが提供する機能にアクセスするためのインターフェースを提供します。ファイル操作はその代表的な機能です。

*   **ファイルを開く/作成する:**
    *   `os.Open(name string) (*File, error)`: 読み取り用に既存のファイルを開きます。
    *   `os.Create(name string) (*File, error)`: 書き込み用に新しいファイルを作成します（存在する場合は内容を切り詰めます）。
    *   `os.OpenFile(name string, flag int, perm FileMode) (*File, error)`: より詳細なオプション（読み書きモード、追記モードなど）を指定してファイルを開きます。
    *   これらの関数は、ファイルを表す `*os.File` 型のポインタと `error` を返します。`*os.File` は `io.Reader` と `io.Writer` の両方を満たします。
*   **ファイルを閉じる:**
    *   `file.Close() error`: 開いたファイルを閉じ、関連するリソースを解放します。**ファイルを開いたら `defer file.Close()` で確実に閉じる**のが定石です。
*   **ファイルの読み書き:**
    *   `file.Read(b []byte) (int, error)`: `io.Reader` の実装。
    *   `file.Write(b []byte) (int, error)`: `io.Writer` の実装。
    *   `os.ReadFile(name string) ([]byte, error)`: ファイル全体を読み込んでバイトスライスとして返します（小さなファイル向け）。
    *   `os.WriteFile(name string, data []byte, perm FileMode)`: バイトスライスをファイルに書き込みます。
*   **その他:** ディレクトリ操作、環境変数アクセス、コマンドライン引数取得など、多くのOS関連機能を提供します。

## コード例: ファイルの読み書き

```go title="os と io を使ったファイル操作"
package main

import (
	"fmt"
	"io" // io.ReadAll, io.WriteString を使うため
	"os" // os.Create, os.Open, os.Stdout, os.Stderr を使うため
)

func main() {
	fileName := "example.txt"

	// --- ファイルへの書き込み ---
	fmt.Println("--- ファイル書き込み ---")
	// 1. ファイルを作成 (書き込みモードで開く)
	writeFile, err := os.Create(fileName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ファイル作成エラー: %v\n", err)
		return
	}
	// 2. defer でファイルを確実に閉じる
	defer writeFile.Close()

	// 3. ファイルに書き込む (io.WriteString を使う例)
	bytesWritten, err := io.WriteString(writeFile, "これはファイルに書き込むテストです。\n2行目です。\n")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ファイル書き込みエラー: %v\n", err)
		return
	}
	fmt.Printf("ファイル '%s' に %d バイト書き込みました。\n", fileName, bytesWritten)
	// writeFile.Close() は main 関数終了時に defer により実行される

	// --- ファイルからの読み込み ---
	fmt.Println("\n--- ファイル読み込み ---")
	// 1. ファイルを開く (読み取りモード)
	readFile, err := os.Open(fileName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ファイルオープンエラー: %v\n", err)
		return
	}
	// 2. defer でファイルを確実に閉じる
	defer readFile.Close()

	// 3. ファイルの内容をすべて読み込む (io.ReadAll を使う例)
	// io.ReadAll は io.Reader を引数に取る (*os.File は io.Reader を満たす)
	content, err := io.ReadAll(readFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ファイル読み込みエラー: %v\n", err)
		return
	}

	// 4. 読み込んだ内容を表示 (バイトスライスを文字列に変換)
	fmt.Printf("ファイル '%s' の内容:\n%s", fileName, string(content))
	// readFile.Close() は main 関数終了時に defer により実行される (writeFile.Close の前)

	// --- 標準入出力 ---
	// os.Stdout (標準出力) や os.Stderr (標準エラー出力) も io.Writer
	fmt.Fprintln(os.Stdout, "\n--- 標準出力への書き込み ---")
	io.WriteString(os.Stdout, "これは標準出力へのメッセージです。\n")

	// 後片付け
	os.Remove(fileName)
}

/* 実行結果:
--- ファイル書き込み ---
ファイル 'example.txt' に 66 バイト書き込みました。

--- ファイル読み込み ---
ファイル 'example.txt' の内容:
これはファイルに書き込むテストです。
2行目です。

--- 標準出力への書き込み ---
これは標準出力へのメッセージです。
*/
```

**コード解説:**

*   `os.Create` でファイルを作成し、`*os.File` 型の `writeFile` を得ます。
*   `defer writeFile.Close()` でファイルのクローズを予約します。
*   `io.WriteString(writeFile, ...)` は `io.Writer` を受け取るため、`*os.File` である `writeFile` を渡せます。
*   `os.Open` でファイルを開き、`*os.File` 型の `readFile` を得ます。
*   `defer readFile.Close()` でクローズを予約します。
*   `io.ReadAll(readFile)` は `io.Reader` を受け取るため、`*os.File` である `readFile` を渡せます。
*   `fmt.Fprintf(os.Stderr, ...)` や `io.WriteString(os.Stdout, ...)` のように、標準エラー出力 (`os.Stderr`) や標準出力 (`os.Stdout`) も `io.Writer` として扱えます。

`io` パッケージのインターフェースと `os` パッケージの具体的なファイル操作機能を組み合わせることで、柔軟で一貫性のあるI/O処理を記述できます。