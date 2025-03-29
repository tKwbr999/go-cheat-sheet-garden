## タイトル
title: I/O 操作: 一時ディレクトリの作成 (`os.MkdirTemp`)

## タグ
tags: ["io-operations", "os", "MkdirTemp", "一時ディレクトリ", "temp", "defer", "RemoveAll"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os"
	// "path/filepath"
)

func main() {
	fmt.Println("一時ディレクトリ作成...")

	// システム一時ディレクトリ内に "myapp-*" パターンのディレクトリ作成
	tempDir, err := os.MkdirTemp("", "myapp-*")
	if err != nil {
		log.Fatalf("作成失敗: %v", err)
	}

	// ★★★ defer で必ず削除 ★★★
	defer func() {
		fmt.Printf("defer: '%s' を削除\n", tempDir)
		err := os.RemoveAll(tempDir) // ディレクトリと中身を削除
		if err != nil { log.Printf("警告: 削除失敗: %v", err) }
	}()

	fmt.Printf("作成された一時ディレクトリ: %s\n", tempDir)

	// --- 一時ディレクトリ内にファイル作成等 ---
	// filePath := filepath.Join(tempDir, "temp.txt")
	// os.WriteFile(filePath, []byte("data"), 0644)
	fmt.Println("一時ディレクトリ内で処理実行中...")

	// main 終了時に defer が実行される
}

```

## 解説
```text
テストや中間ファイル保存等で、一時的なディレクトリが必要な場合、
**`os.MkdirTemp`** 関数 (Go 1.16+) が便利です。
システムの一時ディレクトリ内に衝突しない名前でディレクトリを作成します。
`import "os"` で利用します。

**使い方:**
`name, err := os.MkdirTemp(dir, pattern string)`
*   `dir`: 親ディレクトリ。`""` でシステムデフォルト (例: `/tmp`)。
*   `pattern`: ディレクトリ名のパターン。`*` を含むとランダム置換。
    例: `"myapp-*"`。
*   戻り値:
    *   `name`: 作成された一時ディレクトリのフルパス (`string`)。
    *   `err`: エラー情報 (成功時は `nil`)。

**重要: クリーンアップ**
作成された一時ディレクトリは自動削除されません。
不要になったら**必ず `os.RemoveAll(name)` で削除**します。
リソースリーク等を防ぐため、**`defer os.RemoveAll(tempDir)`** を
使うのが定石です。

コード例では、`os.MkdirTemp` で一時ディレクトリを作成し、
すぐに `defer` で `os.RemoveAll` を登録しています。
これにより `main` 関数終了時にディレクトリが確実に削除されます。
その後、一時ディレクトリ内でファイル作成などの処理を行えます
(例はコメントアウト)。

`os.MkdirTemp` は一時的な作業領域が必要な場合に便利ですが、
`defer os.RemoveAll` による後片付けを忘れないようにしましょう。