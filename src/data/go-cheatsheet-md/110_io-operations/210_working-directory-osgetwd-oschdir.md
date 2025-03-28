---
title: "I/O 操作: カレントワーキングディレクトリ (`os.Getwd`, `os.Chdir`)"
tags: ["io-operations", "os", "Getwd", "Chdir", "ワーキングディレクトリ", "カレントディレクトリ", "パス"]
---

プログラムを実行する際には、**カレントワーキングディレクトリ (Current Working Directory, CWD)** という概念があります。これは、プログラムが現在「いる」ディレクトリのことで、相対パス（例: `"./filename.txt"`, `"../data"`）を指定した際の基準点となります。

`os` パッケージには、カレントワーキングディレクトリを取得したり、変更したりするための関数が用意されています。

`import "os"` として利用します。

## カレントワーキングディレクトリの取得: `os.Getwd()`

`os.Getwd()` 関数は、現在のワーキングディレクトリのパスを文字列として返します。

**構文:** `dir, err := os.Getwd()`

*   戻り値:
    *   `dir`: カレントワーキングディレクトリのパス (`string`)。通常は絶対パスです。
    *   `err`: ディレクトリパスを取得できなかった場合にエラーを返します（通常は稀です）。

## カレントワーキングディレクトリの変更: `os.Chdir()`

`os.Chdir()` 関数は、カレントワーキングディレクトリを指定されたパスに変更します。

**構文:** `err := os.Chdir(dir string)`

*   `dir`: 新しいワーキングディレクトリのパス (`string`)。相対パスでも絶対パスでも指定できます。
*   戻り値 `err`: ディレクトリの変更に失敗した場合（例: 指定されたパスが存在しない、ディレクトリではない、権限がない）にエラーを返します。

**重要な注意点:**

*   `os.Chdir()` は、プログラムを実行している**プロセス全体**のカレントワーキングディレクトリを変更します。これは、**すべての Goroutine に影響を与えます**。ある Goroutine が `os.Chdir()` を呼び出すと、他の Goroutine が相対パスを使ってファイルアクセスなどを行う際の基準点も変わってしまうため、意図しない動作を引き起こす可能性があります。
*   そのため、特に並行処理を行うプログラムでは、**`os.Chdir()` の使用は慎重に行う**必要があります。可能であれば、ファイルアクセスなどには常に**絶対パス**を使うか、あるいは `os.Chdir()` を使わずにパスを組み立てる（`filepath.Join` など）方が安全な場合が多いです。

## コード例

```go title="Getwd と Chdir の使用例"
package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func main() {
	// --- 現在のワーキングディレクトリを取得 ---
	initialWd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Getwd 失敗: %v", err)
	}
	fmt.Printf("初期ワーキングディレクトリ: %s\n", initialWd)

	// --- 一時ディレクトリを作成して移動 ---
	// (前のセクションの知識を活用)
	tempDir, err := os.MkdirTemp("", "chdir-example-*")
	if err != nil {
		log.Fatalf("MkdirTemp 失敗: %v", err)
	}
	// defer で後片付け (元のディレクトリに戻る処理も追加)
	defer func() {
		// ★ 元のディレクトリに戻る ★
		fmt.Printf("\ndefer: 元のディレクトリ '%s' に戻ります。\n", initialWd)
		if err := os.Chdir(initialWd); err != nil {
			log.Printf("警告: 元のディレクトリへの Chdir 失敗: %v", err)
		}
		// ★ 一時ディレクトリを削除 ★
		fmt.Printf("defer: 一時ディレクトリ '%s' を削除します。\n", tempDir)
		if err := os.RemoveAll(tempDir); err != nil {
			log.Printf("警告: 一時ディレクトリの削除失敗: %v", err)
		}
	}()

	fmt.Printf("一時ディレクトリ '%s' を作成しました。\n", tempDir)

	// --- os.Chdir で一時ディレクトリに移動 ---
	err = os.Chdir(tempDir)
	if err != nil {
		log.Fatalf("Chdir('%s') 失敗: %v", tempDir, err)
	}

	// --- 移動後のワーキングディレクトリを確認 ---
	newWd, err := os.Getwd()
	if err != nil {
		log.Fatalf("移動後の Getwd 失敗: %v", err)
	}
	fmt.Printf("Chdir 後のワーキングディレクトリ: %s\n", newWd)

	// --- 移動後のディレクトリでファイルを作成 ---
	// 相対パス "test.txt" は、現在のワーキングディレクトリ (tempDir) に作成される
	fileName := "test.txt"
	err = os.WriteFile(fileName, []byte("ファイル内容"), 0644)
	if err != nil {
		log.Fatalf("WriteFile('%s') 失敗: %v", fileName, err)
	}
	fmt.Printf("ファイル '%s' を作成しました (場所: %s)\n", fileName, newWd)

	// 絶対パスでも確認
	absPath, _ := filepath.Abs(fileName)
	fmt.Printf("'%s' の絶対パス: %s\n", fileName, absPath)

	// main 関数が終了すると defer が実行され、ディレクトリが元に戻り、一時ディレクトリが削除される
}

/* 実行結果の例 (パスは環境による):
初期ワーキングディレクトリ: /Users/tk/dev/active/go-cheat-sheet-garden
一時ディレクトリ '/var/folders/xx/yyyy/T/chdir-example-1234567890' を作成しました。
Chdir 後のワーキングディレクトリ: /var/folders/xx/yyyy/T/chdir-example-1234567890
ファイル 'test.txt' を作成しました (場所: /var/folders/xx/yyyy/T/chdir-example-1234567890)
'test.txt' の絶対パス: /var/folders/xx/yyyy/T/chdir-example-1234567890/test.txt

defer: 元のディレクトリ '/Users/tk/dev/active/go-cheat-sheet-garden' に戻ります。
defer: 一時ディレクトリ '/var/folders/xx/yyyy/T/chdir-example-1234567890' を削除します。
*/
```

**コード解説:**

*   `os.Getwd()` で最初のワーキングディレクトリを取得し、`initialWd` に保存します。
*   `os.MkdirTemp` で一時ディレクトリを作成します。
*   `defer func() { ... }()` 内で、`os.Chdir(initialWd)` を呼び出してプログラム終了時に元のディレクトリに戻る処理と、`os.RemoveAll(tempDir)` で一時ディレクトリを削除する処理を登録しています。
*   `os.Chdir(tempDir)` でカレントワーキングディレクトリを一時ディレクトリに変更します。
*   変更後、`os.Getwd()` で新しいワーキングディレクトリを確認しています。
*   `os.WriteFile("test.txt", ...)` は、相対パスでファイル名を指定しているため、変更後のカレントワーキングディレクトリ（一時ディレクトリ）内にファイルが作成されます。

`os.Getwd` は現在の実行場所を知るのに役立ちますが、`os.Chdir` はプロセス全体の状態を変更するため、特にライブラリコードなどでは使用を避け、絶対パスや設定ファイルからのパスを使う方が堅牢なプログラムになります。