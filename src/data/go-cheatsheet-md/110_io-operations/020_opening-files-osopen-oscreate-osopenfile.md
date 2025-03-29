## タイトル
title: I/O 操作: ファイルを開く/作成する (`os.Open`, `os.Create`, `os.OpenFile`)

## タグ
tags: ["io-operations", "io", "os", "file", "open", "create", "OpenFile", "ファイル操作", "defer", "Close"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fileName := "test_open.txt"

	// os.Create: 書き込み用に作成 (または上書き)
	file1, err := os.Create(fileName)
	if err != nil { log.Fatalf("Create failed: %v", err) }
	fmt.Printf("'%s' created/opened for writing.\n", fileName)
	defer file1.Close() // ★ 必ず Close する
	// file1.WriteString("...") // 書き込み可能

	// os.Open: 読み取り専用で開く
	file2, err := os.Open(fileName) // 既存ファイルを開く
	if err != nil { log.Fatalf("Open failed: %v", err) }
	fmt.Printf("'%s' opened for reading.\n", fileName)
	defer file2.Close() // ★ 必ず Close する
	// content, _ := io.ReadAll(file2) // 読み取り可能

	// os.OpenFile: 追記モードで開く (例)
	// flag := os.O_WRONLY | os.O_APPEND | os.O_CREATE
	// file3, err := os.OpenFile(fileName, flag, 0644)
	// if err != nil { log.Fatalf("OpenFile failed: %v", err) }
	// fmt.Printf("'%s' opened for appending.\n", fileName)
	// defer file3.Close()
	// file3.WriteString("Appended text.\n")

	os.Remove(fileName) // 後片付け
}

```

## 解説
```text
ファイルを少しずつ読み書きしたり、追記したり、アクセスモードを
細かく制御するには、まずファイルを開く必要があります。
`os` パッケージの `Open`, `Create`, `OpenFile` を使います。
これらは `*os.File` (と `error`) を返します。
`*os.File` は `io.Reader`, `io.Writer`, `io.Closer` 等を満たします。

**重要:** 開いたファイルは**必ず `Close()` で閉じる**必要があります。
リソースリークを防ぐため **`defer file.Close()`** を使うのが定石です。

**`os.Open(name)`:**
*   **読取専用**で既存ファイルを開く。
*   存在しない場合等はエラー。
*   `os.OpenFile(name, os.O_RDONLY, 0)` と同等。

**`os.Create(name)`:**
*   **書込専用**でファイルを開く。
*   存在しなければ**新規作成**。
*   存在すれば内容は**空に上書き (Truncate)**。
*   パーミッションは `0666` (umask 影響あり)。
*   `os.OpenFile(name, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0666)` と同等。

**`os.OpenFile(name, flag, perm)`:**
*   最も汎用的。フラグとパーミッションを細かく指定。
*   `flag`: アクセスモードを `|` で組み合わせる。
    *   `os.O_RDONLY`: 読取専用
    *   `os.O_WRONLY`: 書込専用
    *   `os.O_RDWR`: 読書両用
    *   `os.O_APPEND`: 追記モード
    *   `os.O_CREATE`: なければ作成
    *   `os.O_TRUNC`: あれば空にする
    *   `os.O_EXCL`: `O_CREATE` と併用し、あればエラー
*   `perm`: `O_CREATE` 時のパーミッション (例: `0644`)。

コード例では `os.Create` と `os.Open` の基本的な使い方と
`defer file.Close()` を示しています。
追記などの場合は `os.OpenFile` に適切なフラグを指定します。

どの関数を使うかは、操作内容とファイル存在時の挙動で選択します。