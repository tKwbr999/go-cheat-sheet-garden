---
title: "I/O 操作: ファイルを開く/作成する (`os.Open`, `os.Create`, `os.OpenFile`)"
tags: ["io-operations", "io", "os", "file", "open", "create", "OpenFile", "ファイル操作", "defer", "Close"]
---

`os.ReadFile` や `os.WriteFile` はファイル全体を一度に処理するのに便利ですが、ファイルを少しずつ読み書きしたり、追記したり、より細かくアクセスモードを制御したりしたい場合は、まずファイルを**開く (Open)** 必要があります。ファイルを開くための主要な関数として、`os` パッケージには `Open`, `Create`, `OpenFile` があります。

これらの関数は、成功するとファイルを表す **`*os.File`** 型のポインタと `nil` エラーを返します。`*os.File` は `io.Reader`, `io.Writer`, `io.Closer` などのインターフェースを満たしており、様々な I/O 操作に使用できます。

**重要:** ファイルを開いた後は、処理が終わったら**必ず `Close()` メソッドを呼び出してファイルを閉じる**必要があります。リソースリークを防ぐため、**`defer file.Close()`** を使うのが定石です。

## `os.Open(name string) (*File, error)`

*   **読み取り専用**で既存のファイルを開きます。
*   ファイルが存在しない場合や読み取り権限がない場合はエラーを返します。
*   内部的には `os.OpenFile(name, os.O_RDONLY, 0)` を呼び出すのと同じです。

## `os.Create(name string) (*File, error)`

*   **書き込み専用**でファイルを開きます。
*   ファイルが存在しない場合は**新しく作成**します。
*   ファイルが既に存在する場合は、その内容を**空に切り詰め (Truncate)** ます。
*   パーミッションはデフォルトで `0666` (umask の影響を受ける) になります。
*   内部的には `os.OpenFile(name, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0666)` を呼び出すのと同じです。

## `os.OpenFile(name string, flag int, perm FileMode) (*File, error)`

*   最も汎用的なファイルを開く関数で、フラグ (`flag`) とパーミッション (`perm`) を細かく指定できます。
*   `flag`: ファイルのアクセスモードを指定する定数を**ビットOR (`|`)** で組み合わせます。主なフラグ:
    *   `os.O_RDONLY`: 読み取り専用で開く。
    *   `os.O_WRONLY`: 書き込み専用で開く。
    *   `os.O_RDWR`: 読み書き両用で開く。
    *   `os.O_APPEND`: 書き込み時にファイルの末尾に追記する。
    *   `os.O_CREATE`: ファイルが存在しない場合に新しく作成する。
    *   `os.O_TRUNC`: ファイルが存在する場合に内容を空にする（書き込みモードと同時に使うことが多い）。
    *   `os.O_EXCL`: `O_CREATE` と一緒に使い、ファイルが既に存在する場合はエラーにする。
*   `perm`: `O_CREATE` フラグでファイルが新しく作成される場合のパーミッションを指定します（例: `0644`, `0600`）。`O_CREATE` がない場合は通常 `0` を指定します。

## コード例

```go title="ファイルを開く/作成する例"
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "test_open.txt"

	// --- os.Create: 書き込み用に作成 (または上書き) ---
	fmt.Println("--- os.Create ---")
	file1, err := os.Create(fileName)
	if err != nil {
		log.Fatalf("os.Create 失敗: %v", err)
	}
	fmt.Printf("'%s' を書き込み用に作成/オープンしました。\n", fileName)
	// ★ 必ず Close する ★
	defer file1.Close()
	// ここで file1.Write() などで書き込みができる

	// --- os.Open: 読み取り専用で開く ---
	fmt.Println("\n--- os.Open ---")
	file2, err := os.Open(fileName) // 存在するファイルを開く
	if err != nil {
		log.Fatalf("os.Open 失敗: %v", err)
	}
	fmt.Printf("'%s' を読み取り専用でオープンしました。\n", fileName)
	defer file2.Close()
	// ここで file2.Read() などで読み取りができる
	// _, writeErr := file2.WriteString("test") // 読み取り専用なので書き込みはエラーになる

	// --- os.OpenFile: 追記モードで開く ---
	fmt.Println("\n--- os.OpenFile (追記モード) ---")
	// O_WRONLY (書き込み専用) | O_APPEND (追記) | O_CREATE (なければ作成)
	file3, err := os.OpenFile(fileName, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("os.OpenFile (Append) 失敗: %v", err)
	}
	fmt.Printf("'%s' を追記モードでオープンしました。\n", fileName)
	defer file3.Close()
	// ここで file3.WriteString("\n追記テスト") などで追記できる

	// --- os.OpenFile: 読み書きモードで開く ---
	fmt.Println("\n--- os.OpenFile (読み書きモード) ---")
	// O_RDWR (読み書き) | O_CREATE (なければ作成)
	file4, err := os.OpenFile("another_file.txt", os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("os.OpenFile (ReadWrite) 失敗: %v", err)
	}
	fmt.Println("'another_file.txt' を読み書きモードでオープン/作成しました。")
	defer file4.Close()
	// ここで file4.Read() や file4.Write() ができる

	// --- 後片付け ---
	os.Remove(fileName)
	os.Remove("another_file.txt")
}

/* 実行結果:
--- os.Create ---
'test_open.txt' を書き込み用に作成/オープンしました。
defer: ファイルをクローズします... (file1)

--- os.Open ---
'test_open.txt' を読み取り専用でオープンしました。
defer: ファイルをクローズします... (file2)

--- os.OpenFile (追記モード) ---
'test_open.txt' を追記モードでオープンしました。
defer: ファイルをクローズします... (file3)

--- os.OpenFile (読み書きモード) ---
'another_file.txt' を読み書きモードでオープン/作成しました。
defer: ファイルをクローズします... (file4)
*/
```

**コード解説:**

*   `os.Create` は書き込み用のファイルハンドルを簡単に得る方法です。既存ファイルは上書き（切り詰め）されます。
*   `os.Open` は既存ファイルを読み取り専用で開くための簡単な方法です。
*   `os.OpenFile` はフラグを組み合わせることで、追記 (`O_APPEND`)、読み書き (`O_RDWR`)、存在する場合のみ開く (`O_EXCL` と `O_CREATE` の組み合わせ) など、より柔軟なファイルアクセス制御が可能です。
*   すべてのケースで `defer fileX.Close()` を呼び出し、ファイルのクローズを保証しています。

どの関数を使うかは、ファイルに対して行いたい操作（読み取り、書き込み、追記など）と、ファイルが存在しない場合の挙動（エラーにするか、作成するか）によって選択します。