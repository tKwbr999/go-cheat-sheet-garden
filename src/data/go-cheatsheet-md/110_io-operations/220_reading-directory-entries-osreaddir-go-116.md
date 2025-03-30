## タイトル
title: ディレクトリエントリの読み込み (`os.ReadDir`, Go 1.16+)

## タグ
tags: ["io-operations", "os", "ReadDir", "DirEntry", "ディレクトリ一覧", "ファイル一覧", "Go1.16"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os" // os.ReadDir
)

func main() {
	targetDir := "." // カレントディレクトリ

	fmt.Printf("Reading directory '%s'...\n", targetDir)

	// os.ReadDir でエントリを取得
	entries, err := os.ReadDir(targetDir)
	if err != nil {
		log.Fatalf("ReadDir failed: %v", err)
	}

	fmt.Println("--- Directory Entries ---")
	// 取得したエントリをループ処理
	for _, entry := range entries {
		// entry は os.DirEntry
		fmt.Printf(" Name: %-20s IsDir: %t\n", entry.Name(), entry.IsDir())

		// 詳細情報が必要なら entry.Info() を使う (エラーチェック必要)
		// info, err := entry.Info()
		// if err == nil { fmt.Printf("  Size: %d\n", info.Size()) }
	}
	fmt.Println("-----------------------")
}

```

## 解説
```text
指定ディレクトリ内のファイルやサブディレクトリ一覧を取得するには、
Go 1.16 で導入された **`os.ReadDir`** 関数が効率的で推奨されます。
`import "os"` で利用します。

**使い方:**
`entries, err := os.ReadDir(name string)`
*   `name`: 読み取るディレクトリパス (`"."` でカレント)。
*   `entries`: ディレクトリエントリ情報のスライス (`[]os.DirEntry`)。
    ディレクトリ順でソート済み。
*   `err`: エラー情報 (成功時は `nil`)。

**`os.DirEntry` インターフェース:**
`entries` の各要素が持つメソッド:
*   `Name() string`: ファイル/ディレクトリ名。
*   `IsDir() bool`: ディレクトリなら `true`。
*   `Type() FileMode`: エントリの種類 (ファイル、ディレクトリ等)。
*   `Info() (FileInfo, error)`: 詳細情報 (`os.FileInfo`: サイズ、
    更新日時等) を取得。ファイルシステムへの追加アクセスが
    必要になる場合があり、エラーを返す可能性あり。

コード例では `os.ReadDir(".")` でカレントディレクトリの内容を取得し、
ループで各エントリの `Name()` と `IsDir()` を表示しています。
ファイルサイズ等の詳細情報が必要な場合にのみ `entry.Info()` を
呼び出すのが効率的です。

`os.ReadDir` はディレクトリ直下の一覧をシンプルかつ効率的に
取得する標準的な方法です。