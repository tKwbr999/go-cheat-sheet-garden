## タイトル
title: I/O 操作: ディレクトリツリーの探索 (`filepath.WalkDir`, Go 1.16+)

## タグ
tags: ["io-operations", "os", "filepath", "WalkDir", "WalkDirFunc", "fs", "DirEntry", "ディレクトリ探索", "再帰", "Go1.16"]

## コード
```go
package main

import (
	"fmt"
	"io/fs" // fs.DirEntry, fs.WalkDirFunc
	"log"
	"path/filepath" // filepath.WalkDir, filepath.SkipDir, filepath.Ext
	// "os" // テスト用ファイル作成・削除は省略
)

func main() {
	// 事前にテスト用ディレクトリ・ファイルを作成しておく想定
	// os.MkdirAll("tmp/subdir", 0755)
	// os.MkdirAll("tmp/.git", 0755)
	// os.WriteFile("tmp/file.txt", ...)
	// os.WriteFile("tmp/app.log", ...)
	// os.WriteFile("tmp/subdir/other.log", ...)

	root := "tmp" // 探索開始ディレクトリ
	fmt.Printf("Walking directory '%s'...\n", root)

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		// 1. パスアクセスエラーチェック
		if err != nil {
			fmt.Printf("Error accessing path %q: %v\n", path, err)
			return err // エラーがあれば探索中断 (nil を返せば続行)
		}

		// 2. 特定ディレクトリをスキップ (例: .git)
		if d.IsDir() && d.Name() == ".git" {
			fmt.Printf("Skipping dir: %s\n", path)
			return filepath.SkipDir // このディレクトリ以下は探索しない
		}

		// 3. ファイルのみ対象とし、拡張子チェック (例: .log)
		if !d.IsDir() && filepath.Ext(path) == ".log" {
			fmt.Printf("Found log file: %s\n", path)
		}

		return nil // 探索続行
	})

	if err != nil {
		log.Fatalf("WalkDir failed: %v", err)
	}
	fmt.Println("Walk finished.")
	// os.RemoveAll(root) // 後片付け
}

```

## 解説
```text
指定ディレクトリとその**全サブディレクトリ**を**再帰的に**探索するには、
Go 1.16+ で導入された **`filepath.WalkDir`** が推奨されます。
(`filepath.Walk` より効率的な場合がある)
`import "path/filepath"` と `import "io/fs"` が必要です。

**使い方:**
`err := filepath.WalkDir(root string, fn fs.WalkDirFunc)`
*   `root`: 探索開始ディレクトリパス。
*   `fn`: 各エントリで見つかる度に呼び出されるコールバック関数。
*   `err`: 探索中に `fn` が `nil` 以外を返した場合等のエラー。

**コールバック関数 `fs.WalkDirFunc`:**
`func(path string, d fs.DirEntry, err error) error`
*   `path`: 現在のエントリのフルパス。
*   `d`: エントリ情報 (`fs.DirEntry`: `Name()`, `IsDir()` 等)。
*   `err`: `path` へのアクセスエラー (権限等)。`nil` でない場合 `d` は無効かも。
*   **戻り値 `error`**:
    *   `nil`: 探索を**続行**。
    *   **`filepath.SkipDir`**: `d` がディレクトリの場合、その中身を**スキップ**。
    *   その他エラー: 探索を**中断**し、そのエラーが `WalkDir` の戻り値になる。

コード例では、`tmp` ディレクトリ以下を探索し、
コールバック関数内で以下の処理を行っています。
1. パスアクセスエラーがあれば中断 (ここでは `err` を返している)。
2. `.git` ディレクトリを見つけたら `filepath.SkipDir` でスキップ。
3. ファイルであり、かつ拡張子が `.log` ならパスを表示。
4. 上記以外は `nil` を返し探索続行。

`filepath.WalkDir` はファイル検索、一括処理、バックアップ等、
ファイルシステムの再帰操作に強力なツールです。
コールバックの戻り値で探索を制御できます。