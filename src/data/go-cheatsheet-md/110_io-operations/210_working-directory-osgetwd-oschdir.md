## タイトル
title: カレントワーキングディレクトリ (`os.Getwd`, `os.Chdir`)

## タグ
tags: ["io-operations", "os", "Getwd", "Chdir", "ワーキングディレクトリ", "カレントディレクトリ", "パス"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	// 現在のワーキングディレクトリを取得
	initialWd, err := os.Getwd()
	if err != nil { log.Fatalf("Getwd failed: %v", err) }
	fmt.Printf("Initial WD: %s\n", initialWd)

	// (例: 一時ディレクトリを作成)
	// tempDir, _ := os.MkdirTemp("", "chdir-example-*")
	// defer os.RemoveAll(tempDir)
	// defer os.Chdir(initialWd) // 元に戻る defer

	// os.Chdir でワーキングディレクトリを変更 (例: /tmp へ)
	// 注意: 存在し、アクセス可能なディレクトリを指定する必要がある
	targetDir := os.TempDir() // システムの一時ディレクトリを取得
	fmt.Printf("Changing WD to: %s\n", targetDir)
	err = os.Chdir(targetDir)
	if err != nil {
		log.Fatalf("Chdir to %s failed: %v", targetDir, err)
	}

	// 変更後のワーキングディレクトリを確認
	newWd, err := os.Getwd()
	if err != nil { log.Fatalf("Getwd after Chdir failed: %v", err) }
	fmt.Printf("New WD: %s\n", newWd)

	// 相対パスでのファイル操作は newWd が基準になる
	// os.WriteFile("relative.txt", ...)
}

```

## 解説
```text
プログラム実行時の**カレントワーキングディレクトリ (CWD)** は、
相対パスの基準点です。`os` パッケージで取得・変更できます。
`import "os"` で利用します。

**取得: `os.Getwd()`**
現在のワーキングディレクトリのパス (`string`) と `error` を返します。
`dir, err := os.Getwd()`

**変更: `os.Chdir()`**
カレントワーキングディレクトリを指定パス `dir` に変更します。
`err := os.Chdir(dir string)`
*   `dir`: 新しいディレクトリパス (相対/絶対)。
*   `err`: 失敗時 (パス不正、権限不足等) にエラー。

**重要な注意点:**
*   `os.Chdir()` は**プロセス全体**の CWD を変更し、
    **すべての Goroutine に影響**します。
*   並行処理中に `Chdir` を使うと、他の Goroutine の相対パス解釈が
    意図せず変わり、問題を引き起こす可能性があります。
*   **`os.Chdir()` の使用は慎重に**。可能なら**絶対パス**を使うか、
    `filepath.Join` 等でパスを組み立てる方が安全です。

コード例では、`os.Getwd` で初期ディレクトリを取得し、
`os.Chdir` で一時ディレクトリ (例として `os.TempDir()`) に移動、
再度 `os.Getwd` で変更を確認しています。
(実際には `defer os.Chdir(initialWd)` で元に戻す処理を入れるべき)

`Getwd` は現在の場所を知るのに役立ちますが、`Chdir` は
プロセス全体の状態を変えるため、特にライブラリ等では避けるべきです。