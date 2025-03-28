---
title: "I/O 操作: ディレクトリツリーの探索 (`filepath.WalkDir`, Go 1.16+)"
tags: ["io-operations", "os", "filepath", "WalkDir", "WalkDirFunc", "fs", "DirEntry", "ディレクトリ探索", "再帰", "Go1.16"]
---

指定したディレクトリとその**すべてのサブディレクトリ**に含まれるファイルやディレクトリを**再帰的に**処理したい場合、Go 1.16 で導入された **`filepath.WalkDir`** 関数を使うのが効率的で推奨される方法です。（それ以前は `filepath.Walk` が使われていましたが、`WalkDir` は `fs.DirEntry` を使うため、不要な `os.Stat` 呼び出しを避けられる利点があります。）

`import "path/filepath"` と `import "io/fs"` (コールバック関数の型定義のため) として利用します。

## `filepath.WalkDir()` の使い方

`filepath.WalkDir()` は、指定されたルートディレクトリ `root` から開始し、ディレクトリツリーを**深さ優先**で探索します。見つかった各ファイルまたはディレクトリに対して、指定されたコールバック関数 `fn` を呼び出します。

**構文:** `err := filepath.WalkDir(root string, fn fs.WalkDirFunc)`

*   `root`: 探索を開始するルートディレクトリのパス (`string`)。
*   `fn`: 各エントリに対して呼び出されるコールバック関数 (`fs.WalkDirFunc` 型)。
*   戻り値 `err`: 探索中にコールバック関数 `fn` が `nil` 以外のエラーを返した場合、または探索自体でエラーが発生した場合に、そのエラーを返します。正常に完了した場合は `nil` を返します。

## コールバック関数 `fs.WalkDirFunc`

コールバック関数 `fn` は以下のシグネチャを持ちます。

**シグネチャ:** `type WalkDirFunc func(path string, d fs.DirEntry, err error) error`

*   `path`: 現在処理中のファイルまたはディレクトリのフルパス (`string`)。
*   `d`: 現在処理中のエントリの情報 (`fs.DirEntry` インターフェース)。`d.Name()`, `d.IsDir()`, `d.Type()`, `d.Info()` などのメソッドを使えます。
*   `err`: このエントリ `path` にアクセスする際に発生したエラー（例: 権限エラー）。もし `err != nil` なら、`d` は無効な場合があります。
*   **戻り値 `error`**:
    *   `nil`: 探索を**続行**します。
    *   **`filepath.SkipDir`**: もし `d` がディレクトリの場合、この特別なエラー値を返すと、そのディレクトリの**中身は探索せずにスキップ**します。ファイルに対して返しても効果はありません。
    *   その他の `nil` でないエラー: 探索を**中断**し、そのエラーが `WalkDir` の戻り値となります。

## コード例: 特定の拡張子のファイルを検索

カレントディレクトリ (`.`) 以下を再帰的に探索し、`.log` という拡張子を持つファイルのみを表示する例です。`.git` ディレクトリはスキップします。

```go title="filepath.WalkDir の使用例"
package main

import (
	"fmt"
	"io/fs" // fs.DirEntry, fs.WalkDirFunc を使うため
	"log"
	"os"
	"path/filepath" // filepath.WalkDir, filepath.SkipDir, filepath.Ext を使うため
	"strings"
)

func main() {
	// --- テスト用のディレクトリとファイルを作成 ---
	// (エラーハンドリングは省略)
	os.MkdirAll("tmp/subdir1", 0755)
	os.MkdirAll("tmp/.git", 0755) // スキップ対象
	os.WriteFile("tmp/file1.txt", []byte("text"), 0644)
	os.WriteFile("tmp/app.log", []byte("log data 1"), 0644)
	os.WriteFile("tmp/subdir1/file2.txt", []byte("more text"), 0644)
	os.WriteFile("tmp/subdir1/another.log", []byte("log data 2"), 0644)
	os.WriteFile("tmp/.git/config", []byte("git config"), 0644)
	fmt.Println("テスト用のディレクトリとファイルを作成しました。")

	// --- filepath.WalkDir で探索 ---
	fmt.Println("\n--- .log ファイルを探索 ('.git' はスキップ) ---")
	root := "tmp" // 探索を開始するディレクトリ

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		// 1. エラーチェック (パスへのアクセスエラーなど)
		if err != nil {
			fmt.Printf("警告: パス '%s' へのアクセスエラー: %v (続行します)\n", path, err)
			// エラーが発生したパスの処理はできないが、探索自体は続けたい場合は nil を返す
			// return err // ここでエラーを返すと WalkDir が中断される
			return nil
		}

		// 2. ディレクトリのスキップ処理
		if d.IsDir() && d.Name() == ".git" {
			fmt.Printf("ディレクトリ '%s' をスキップします。\n", path)
			return filepath.SkipDir // ★ このディレクトリ以下は探索しない
		}

		// 3. ファイルのみを対象とし、拡張子をチェック
		if !d.IsDir() {
			// if strings.HasSuffix(d.Name(), ".log") { // 単純なサフィックスチェック
			if filepath.Ext(d.Name()) == ".log" { // filepath.Ext を使う方が確実
				fmt.Printf("発見: %s\n", path)
			}
		}

		// 4. 探索を続ける場合は nil を返す
		return nil
	})

	// WalkDir 全体のエラーチェック
	if err != nil {
		log.Fatalf("WalkDir 実行中にエラーが発生しました: %v", err)
	}

	fmt.Println("\n--- 探索完了 ---")

	// --- 後片付け ---
	os.RemoveAll(root)
	fmt.Println("\nテスト用ディレクトリを削除しました。")
}

/* 実行結果:
テスト用のディレクトリとファイルを作成しました。

--- .log ファイルを探索 ('.git' はスキップ) ---
ディレクトリ 'tmp/.git' をスキップします。
発見: tmp/app.log
発見: tmp/subdir1/another.log

--- 探索完了 ---

テスト用ディレクトリを削除しました。
*/
```

**コード解説:**

*   `filepath.WalkDir("tmp", func(...) error { ... })`: `tmp` ディレクトリから探索を開始し、見つかった各エントリに対してコールバック関数を実行します。
*   **コールバック関数内:**
    *   `if err != nil { ... }`: まず、そのパスへのアクセス自体にエラーがなかったかを確認します。ここではエラーがあっても `nil` を返して探索を続行しています。
    *   `if d.IsDir() && d.Name() == ".git" { return filepath.SkipDir }`: エントリがディレクトリで、かつ名前が `.git` であれば、`filepath.SkipDir` を返してそのディレクトリ以下の探索をスキップします。
    *   `if !d.IsDir() { ... }`: エントリがファイルの場合のみ処理を進めます。
    *   `if filepath.Ext(d.Name()) == ".log"`: `filepath.Ext` でファイルの拡張子を取得し、`.log` であればパスを表示します。
    *   `return nil`: 上記のいずれの条件にも当てはまらない場合（処理対象外のファイルや、スキップしないディレクトリ）、または処理が正常に完了した場合は `nil` を返し、探索を続行します。
*   `WalkDir` の呼び出し後にもエラーチェックを行い、コールバック関数が途中でエラーを返した場合や、探索自体に問題があった場合に備えます。

`filepath.WalkDir` は、ファイルシステムの再帰的な操作（特定ファイルの検索、一括リネーム、バックアップなど）を行う際の強力なツールです。コールバック関数で `filepath.SkipDir` やエラーを適切に返すことで、探索の挙動を柔軟に制御できます。