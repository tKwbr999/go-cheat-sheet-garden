---
title: "I/O 操作: ファイルへの書き込み (`file.Write`, `file.WriteString`)"
tags: ["io-operations", "io", "os", "file", "write", "WriteString", "Writer", "ファイル書き込み"]
---

`os.WriteFile` はファイル全体を一度に書き込みますが、データを少しずつファイルに書き込みたい場合や、既に開いているファイルに追加で書き込みたい場合は、`*os.File` が持つ **`Write`** メソッドを使います。

`os.Create` や `os.OpenFile` で書き込み可能モードで取得した `*os.File` は `io.Writer` インターフェースを満たしており、`Write` メソッドを持っています。

## `file.Write()` の使い方

`Write` メソッドは、引数として渡されたバイトスライス `p` の内容をファイルに書き込みます。

**シグネチャ:** `func (f *File) Write(p []byte) (n int, err error)`

*   `p`: ファイルに書き込むデータを含むバイトスライス (`[]byte`)。
*   戻り値:
    *   `n`: 実際にファイルに書き込まれたバイト数。通常は `len(p)` と同じはずですが、ディスク容量不足などで一部しか書き込めなかった場合は少なくなる可能性があります。
    *   `err`: 書き込み中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

## `file.WriteString()` の使い方

文字列 (`string`) を直接ファイルに書き込みたい場合は、`WriteString` メソッドが便利です。内部的には文字列をバイトスライスに変換して `Write` を呼び出します。

**シグネチャ:** `func (f *File) WriteString(s string) (n int, err error)`

*   `s`: ファイルに書き込む文字列 (`string`)。
*   戻り値: `Write` と同様。

## コード例

```go title="file.Write と file.WriteString の使用例"
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "output_write.txt"

	// --- os.Create で書き込み用にファイルを開く ---
	// (既に存在する場合は内容が空になる)
	file, err := os.Create(fileName)
	if err != nil {
		log.Fatalf("ファイル作成失敗: %v", err)
	}
	// ★ defer でファイルを確実に閉じる ★
	defer file.Close()

	fmt.Printf("ファイル '%s' を書き込み用にオープンしました。\n", fileName)

	// --- file.Write でバイトスライスを書き込む ---
	data1 := []byte("Hello from Write!\n")
	bytesWritten1, err := file.Write(data1)
	if err != nil {
		log.Fatalf("Write 失敗: %v", err)
	}
	fmt.Printf("Write: %d バイト書き込みました。\n", bytesWritten1)

	// --- file.WriteString で文字列を書き込む ---
	data2 := "WriteString is convenient.\n"
	bytesWritten2, err := file.WriteString(data2)
	if err != nil {
		log.Fatalf("WriteString 失敗: %v", err)
	}
	fmt.Printf("WriteString: %d バイト書き込みました。\n", bytesWritten2)

	// --- fmt.Fprintf を使う方法 ---
	// *os.File は io.Writer なので、Fprintf も使える
	data3 := "Fprintf also works!"
	bytesWritten3, err := fmt.Fprintf(file, "%s\n", data3) // Fprintf はフォーマット後のバイト数を返す
	if err != nil {
		log.Fatalf("Fprintf 失敗: %v", err)
	}
	fmt.Printf("Fprintf: %d バイト書き込みました。\n", bytesWritten3)


	fmt.Println("\nファイルへの書き込みが完了しました。")

	// --- 確認のため、書き込んだファイルを読み込んでみる ---
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
ファイル 'output_write.txt' を書き込み用にオープンしました。
Write: 18 バイト書き込みました。
WriteString: 26 バイト書き込みました。
Fprintf: 20 バイト書き込みました。

ファイルへの書き込みが完了しました。

--- 書き込んだファイルの内容 ---
Hello from Write!
WriteString is convenient.
Fprintf also works!
-------------------------
*/
```

**コード解説:**

*   `os.Create` でファイルを開き、`defer file.Close()` でクローズを予約します。
*   `file.Write(data1)`: バイトスライス `data1` をファイルに書き込みます。
*   `file.WriteString(data2)`: 文字列 `data2` をファイルに書き込みます。
*   `fmt.Fprintf(file, "%s\n", data3)`: `*os.File` は `io.Writer` なので、`fmt.Fprintf` の第一引数に渡してフォーマットされた文字列を書き込むこともできます。
*   各書き込み操作の後でエラーチェックを行っています。

`file.Write` や `file.WriteString` は、ファイルにデータを少しずつ書き込んだり、生成しながら書き込んだりする場合に使います。`os.WriteFile` と異なり、ファイルを開いたまま複数の書き込み操作を行うことができます。