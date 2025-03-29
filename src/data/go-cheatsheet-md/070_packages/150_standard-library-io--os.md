## タイトル
title: 標準ライブラリ: `io` / `os` パッケージ (基本的な入出力とOS機能)

## タグ
tags: ["packages", "standard library", "io", "os", "ファイル操作", "入出力", "Reader", "Writer", "defer"]

## コード
```go
package main

import (
	"fmt"
	"io"
	"os"
)

func main() {
	fileName := "example.txt"

	// --- ファイル書き込み ---
	writeFile, err := os.Create(fileName) // ファイル作成/オープン
	if err != nil { /* エラー処理 */ return }
	defer writeFile.Close() // ★ 関数終了時に必ず閉じる

	_, err = io.WriteString(writeFile, "ファイル書き込みテスト。\n")
	if err != nil { /* エラー処理 */ return }
	fmt.Printf("'%s' に書き込み完了\n", fileName)

	// --- ファイル読み込み ---
	readFile, err := os.Open(fileName) // ファイルを開く
	if err != nil { /* エラー処理 */ return }
	defer readFile.Close() // ★ 関数終了時に必ず閉じる

	content, err := io.ReadAll(readFile) // 全内容読み込み
	if err != nil { /* エラー処理 */ return }
	fmt.Printf("'%s' の内容:\n%s", fileName, string(content))

	os.Remove(fileName) // 後片付け
}

```

## 解説
```text
基本的な**入出力 (I/O)** やファイル操作には
主に **`io`** と **`os`** パッケージを使います。

**`io` パッケージ: I/O 抽象化**
データストリームに対する共通操作インターフェースを提供。
*   **`io.Reader`**: `Read([]byte)` メソッドでデータ読み取り。
*   **`io.Writer`**: `Write([]byte)` メソッドでデータ書き込み。
これらを使うと、データソース/シンクの種類 (ファイル、メモリ等) を
意識せずに読み書き処理を書けます。
`io.Copy`, `io.ReadAll` 等の便利関数も提供。

**`os` パッケージ: OS機能**
ファイル操作、環境変数、引数などOS機能へのアクセスを提供。
*   **ファイル操作:**
    *   `os.Open(path)`: 読み取り用に開く。
    *   `os.Create(path)`: 書き込み用に新規作成 (既存なら上書き)。
    *   `os.OpenFile(path, flag, perm)`: 詳細オプションで開く。
    *   これらは `*os.File` (と `error`) を返す。
    *   `*os.File` は `io.Reader` と `io.Writer` を満たす。
    *   `file.Close()`: **ファイルを閉じ、リソース解放。
        `defer file.Close()` で確実に呼ぶのが重要。**
    *   `file.Read()`, `file.Write()`: `io` インターフェースの実装。
    *   `os.ReadFile(path)`, `os.WriteFile(path, data, perm)`:
        ファイル全体を簡単に読み書き (小さなファイル向け)。
*   **標準入出力:**
    *   `os.Stdin`: 標準入力 (`io.Reader`)。
    *   `os.Stdout`: 標準出力 (`io.Writer`)。
    *   `os.Stderr`: 標準エラー出力 (`io.Writer`)。
    これらも `io` 関数 (例: `io.Copy(os.Stdout, file)`) や
    `fmt.Fprint` 系で利用可能。

コード例では `os.Create` でファイルを作成し、`defer` で `Close` を予約、
`io.WriteString` で書き込み。次に `os.Open` で開き、`defer` で `Close`、
`io.ReadAll` で読み込んでいます。

`io` の抽象化と `os` の具体的機能を組み合わせるのが基本です。