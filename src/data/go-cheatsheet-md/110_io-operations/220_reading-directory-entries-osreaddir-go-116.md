---
title: "I/O 操作: ディレクトリエントリの読み込み (`os.ReadDir`, Go 1.16+)"
tags: ["io-operations", "os", "ReadDir", "DirEntry", "ディレクトリ一覧", "ファイル一覧", "Go1.16"]
---

指定したディレクトリに含まれるファイルやサブディレクトリの一覧を取得したい場合、Go 1.16 で導入された **`os.ReadDir`** 関数を使うのが効率的で推奨される方法です。（それ以前は `*os.File` の `Readdir` メソッドが使われていましたが、`ReadDir` の方がパフォーマンスが良い場合があります。）

`import "os"` として利用します。

## `os.ReadDir()` の使い方

`os.ReadDir()` は、指定されたディレクトリパス (`name`) を読み取り、そのディレクトリに含まれるエントリ（ファイルやサブディレクトリ）の情報を **`os.DirEntry`** のスライス (`[]os.DirEntry`) として返します。返されるスライスはディレクトリ順でソートされています。

**構文:** `entries, err := os.ReadDir(name string)`

*   `name`: 内容を読み取りたいディレクトリのパス (`string`)。カレントディレクトリの場合は `"."` を指定します。
*   戻り値:
    *   `entries`: ディレクトリエントリ情報のスライス (`[]os.DirEntry`)。各要素がファイルやサブディレクトリを表します。
    *   `err`: ディレクトリの読み取り中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

## `os.DirEntry` インターフェース

`os.ReadDir` が返すスライスの各要素は `os.DirEntry` インターフェースを満たす値です。このインターフェースは、エントリに関する基本的な情報を提供するメソッドを持っています。

*   **`Name() string`**: ファイルまたはディレクトリの名前を返します。
*   **`IsDir() bool`**: エントリがディレクトリであれば `true` を返します。
*   **`Type() FileMode`**: エントリの種類（ファイル、ディレクトリ、シンボリックリンクなど）を示す `os.FileMode` のタイプビットを返します。`IsDir()` は `Type()&os.ModeDir != 0` と同じです。
*   **`Info() (FileInfo, error)`**: より詳細なファイル情報 (`os.FileInfo` インターフェース、サイズや更新日時などを含む）を取得します。ファイルシステムへの追加アクセスが必要になる場合があるため、エラーを返す可能性があります。

## コード例

カレントディレクトリの内容を一覧表示する例です。

```go title="os.ReadDir の使用例"
package main

import (
	"fmt"
	"log"
	"os" // os.ReadDir, os.DirEntry を使うため
)

func main() {
	targetDir := "." // カレントディレクトリを指定

	fmt.Printf("ディレクトリ '%s' の内容を読み込みます...\n", targetDir)

	// --- os.ReadDir でエントリを取得 ---
	entries, err := os.ReadDir(targetDir)
	if err != nil {
		log.Fatalf("ReadDir 失敗: %v", err)
	}

	fmt.Println("--- ディレクトリエントリ一覧 ---")
	// --- 取得したエントリをループで処理 ---
	for _, entry := range entries {
		// entry は os.DirEntry 型
		entryName := entry.Name()
		isDir := entry.IsDir()

		fmt.Printf("名前: %-20s ディレクトリ: %t", entryName, isDir)

		// --- entry.Info() で詳細情報を取得 (オプション) ---
		// Info() はエラーを返す可能性があるのでチェックする
		info, err := entry.Info()
		if err != nil {
			fmt.Printf(" (Info取得エラー: %v)\n", err)
		} else {
			// info は os.FileInfo 型
			fmt.Printf(" サイズ: %-10d 更新日時: %s\n", info.Size(), info.ModTime().Format("2006-01-02 15:04"))
		}
	}

	fmt.Println("\n--- 処理完了 ---")
}

/* 実行結果の例 (カレントディレクトリの内容によって異なります):
ディレクトリ '.' の内容を読み込みます...
--- ディレクトリエントリ一覧 ---
名前: .git                 ディレクトリ: true サイズ: 256        更新日時: 2025-03-28 15:00
名前: .gitignore           ディレクトリ: false サイズ: 100        更新日時: 2025-03-28 15:01
名前: README.md            ディレクトリ: false サイズ: 1500       更新日時: 2025-03-28 15:02
名前: go.mod               ディレクトリ: false サイズ: 50         更新日時: 2025-03-28 15:03
名前: main.go              ディレクトリ: false サイズ: 2048       更新日時: 2025-03-28 15:04
名前: public               ディレクトリ: true サイズ: 128        更新日時: 2025-03-28 15:05
名前: src                  ディレクトリ: true サイズ: 512        更新日時: 2025-03-29 02:13
... (他のファイルやディレクトリ) ...

--- 処理完了 ---
*/
```

**コード解説:**

*   `os.ReadDir(".")` でカレントディレクトリのエントリを取得します。
*   `for _, entry := range entries` で取得した `[]os.DirEntry` をループ処理します。
*   `entry.Name()` で名前、`entry.IsDir()` でディレクトリかどうかを取得して表示します。
*   `entry.Info()` を呼び出すと、より詳細な `os.FileInfo` が取得できます。これには `Size()` (ファイルサイズ) や `ModTime()` (最終更新日時) などのメソッドがあります。`Info()` はエラーを返す可能性があるため、エラーチェックを行っています。

`os.ReadDir` は、特定のディレクトリ直下のファイルやサブディレクトリの一覧をシンプルかつ効率的に取得するための標準的な方法です。ファイルサイズや更新日時などの詳細情報が必要な場合は `entry.Info()` を使いますが、不要な場合は `Name()` や `IsDir()` だけを使う方が効率的です。