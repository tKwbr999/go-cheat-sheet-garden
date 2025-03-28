---
title: "I/O 操作: 一時ファイルの作成 (`os.CreateTemp`)"
tags: ["io-operations", "os", "CreateTemp", "一時ファイル", "temp", "defer", "Remove", "Close"]
---

一時的なデータをファイルに書き込みたいが、ディレクトリ全体は必要ない場合、**`os.CreateTemp`** 関数を使って一時ファイルを直接作成することができます。これも Go 1.16 で導入されました（それ以前は `io/ioutil.TempFile` が使われていました）。

`import "os"` として利用します。

## `os.CreateTemp()` の使い方

`os.CreateTemp()` は、指定されたディレクトリ内に、指定されたパターンに基づいた名前で新しい一時ファイルを**作成し、読み書き用に開きます**。

**構文:** `f *File, err := os.CreateTemp(dir, pattern string)`

*   `dir`: 一時ファイルを作成する親ディレクトリのパスを指定します。
    *   空文字列 (`""`) を指定すると、システムデフォルトの一時ディレクトリ（`os.TempDir()`）が使われます。通常はこちらを指定します。
*   `pattern`: 作成されるファイル名のパターンを指定します。
    *   `os.MkdirTemp` と同様に、アスタリスク (`*`) が含まれている場合、その部分はランダムな文字列に置き換えられます。
    *   アスタリスクが含まれていない場合は、パターン名の末尾にランダムな文字列が付加されます。
    *   例: `"myapp-*.log"`, `"data-"`, `"*.tmp"`
*   戻り値:
    *   `f`: 作成され、読み書き用に開かれた一時ファイルを表す `*os.File` ポインタ。
    *   `err`: ファイルの作成やオープン中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

**重要: クリーンアップ (2段階)**
`os.CreateTemp` で作成した一時ファイルは、プログラムが終了しても**自動的には削除されません**。不要になった時点で、**必ず後片付け**を行う必要があります。これには2つのステップが必要です。

1.  **ファイルを閉じる:** `*os.File` を使い終わったら、**`file.Close()`** を呼び出してファイルハンドルを閉じます。`defer file.Close()` を使うのが定石です。
2.  **ファイルを削除する:** ファイル自体をディスクから削除するために、**`os.Remove(filename)`** を呼び出します。ファイル名は `file.Name()` で取得できます。これも `defer os.Remove(tempFile.Name())` のように `defer` を使うのが一般的です。

**`defer` の順序:** `defer` は後から登録されたものが先に実行される (LIFO: Last In, First Out) ため、通常は `Close()` を先に `defer` し、その後に `Remove()` を `defer` します（ファイルが開いていると削除できない場合があるため）。

## コード例

```go title="os.CreateTemp の使用例"
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Println("一時ファイルを作成します...")

	// システムデフォルトの一時ディレクトリ内に "temp-data-*.txt" というパターンのファイルを作成
	tempFile, err := os.CreateTemp("", "temp-data-*.txt")
	if err != nil {
		log.Fatalf("一時ファイルの作成に失敗: %v", err)
	}

	// ★★★ 重要: 2段階の defer でクリーンアップ ★★★
	// 1. ファイルハンドルを閉じる (Remove より先に defer)
	defer func() {
		fmt.Printf("defer: ファイルハンドル '%s' をクローズします。\n", tempFile.Name())
		err := tempFile.Close()
		if err != nil {
			log.Printf("警告: 一時ファイルのクローズに失敗: %v", err)
		}
	}()
	// 2. ファイル自体を削除する (Close より後に defer)
	defer func() {
		fmt.Printf("defer: 一時ファイル '%s' を削除します。\n", tempFile.Name())
		err := os.Remove(tempFile.Name()) // ファイル名を指定して削除
		if err != nil {
			log.Printf("警告: 一時ファイルの削除に失敗: %v", err)
		}
	}()


	fmt.Printf("作成された一時ファイル: %s\n", tempFile.Name())

	// --- 作成した一時ファイルに書き込む例 ---
	content := []byte("これは一時ファイルに書き込むデータです。")
	if _, err := tempFile.Write(content); err != nil {
		log.Fatalf("一時ファイルへの書き込みに失敗: %v", err)
	}
	fmt.Printf("一時ファイルに %d バイト書き込みました。\n", len(content))

	// ... ここで一時ファイルを使った処理を行う ...
	// (例: 別の関数に tempFile.Name() を渡すなど)
	fmt.Println("一時ファイルを使った処理を実行中...")


	// main 関数が終了すると、defer が逆順 (Remove -> Close) で実行される
	// (ただし、上の defer の書き方だと Close -> Remove の順でメッセージが出る)
	// 重要なのは、両方のクリーンアップが登録されていること
}

/* 実行結果の例 (一時ファイルのパスは環境や実行ごとに異なる):
一時ファイルを作成します...
作成された一時ファイル: /var/folders/xx/yyyy/T/temp-data-1234567890.txt
一時ファイルに 49 バイト書き込みました。
一時ファイルを使った処理を実行中...
defer: 一時ファイル '/var/folders/xx/yyyy/T/temp-data-1234567890.txt' を削除します。
defer: ファイルハンドル '/var/folders/xx/yyyy/T/temp-data-1234567890.txt' をクローズします。
*/
```

**コード解説:**

*   `os.CreateTemp("", "temp-data-*.txt")`: システムの一時領域に `temp-data-` で始まりランダムな文字列が続き `.txt` で終わる名前のファイルを作成し、読み書き用に開きます。
*   `defer func() { tempFile.Close() }()`: ファイルハンドルを閉じる処理を `defer` で登録します。
*   `defer func() { os.Remove(tempFile.Name()) }()`: ファイル自体を削除する処理を `defer` で登録します。`tempFile.Name()` で作成されたファイル名（フルパス）を取得できます。
*   `tempFile.Write(content)`: 開かれた一時ファイルにデータを書き込みます。

`os.CreateTemp` は、一時的なデータをファイルシステム上に保存する必要がある場合に便利です。`os.MkdirTemp` と同様に、`defer` を使った後片付け（`Close` と `Remove` の両方）を忘れないようにすることが非常に重要です。