## タイトル
title: I/O 操作: 一時ファイルの作成 (`os.CreateTemp`)

## タグ
tags: ["io-operations", "os", "CreateTemp", "一時ファイル", "temp", "defer", "Remove", "Close"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Println("一時ファイル作成...")

	// 一時ディレクトリ内に "temp-*.txt" パターンのファイルを作成・オープン
	tempFile, err := os.CreateTemp("", "temp-*.txt")
	if err != nil { log.Fatal(err) }

	// ★★★ 2段階 defer でクリーンアップ ★★★
	// 1. ファイルハンドルを閉じる (Remove より先に defer)
	defer func() {
		fmt.Printf("defer: Close '%s'\n", tempFile.Name())
		tempFile.Close()
	}()
	// 2. ファイル自体を削除する (Close より後に defer)
	defer func() {
		fmt.Printf("defer: Remove '%s'\n", tempFile.Name())
		os.Remove(tempFile.Name())
	}()


	fmt.Printf("作成された一時ファイル: %s\n", tempFile.Name())

	// 一時ファイルに書き込む
	_, err = tempFile.Write([]byte("一時データ"))
	if err != nil { log.Fatal(err) }
	fmt.Println("一時ファイルに書き込み完了")

	// main 終了時に defer が逆順 (Remove -> Close) で実行される
}

```

## 解説
```text
一時的なデータをファイルに書き込みたい場合 (ディレクトリは不要)、
**`os.CreateTemp`** 関数 (Go 1.16+) が使えます。
指定ディレクトリ内にユニークな名前で一時ファイルを**作成し、
読み書き用に開きます**。`import "os"` で利用します。

**使い方:**
`f, err := os.CreateTemp(dir, pattern string)`
*   `dir`: 親ディレクトリ。`""` でシステムデフォルト。
*   `pattern`: ファイル名のパターン。`*` はランダム置換。
    例: `"myapp-*.tmp"`, `"data-"`。
*   戻り値:
    *   `f`: 作成・オープンされた一時ファイルの `*os.File` ポインタ。
    *   `err`: エラー情報 (成功時は `nil`)。

**重要: クリーンアップ (2段階)**
作成された一時ファイルは自動削除されません。
**必ず**後片付けが必要です。
1. **ファイルを閉じる:** `defer file.Close()`
2. **ファイルを削除する:** `defer os.Remove(tempFile.Name())`
   (`file.Name()` でファイル名取得)

**`defer` の順序:** `defer` は後登録が先実行 (LIFO) なので、
通常 `Close()` を先に `defer` し、次に `Remove()` を `defer` します
(ファイルが開いていると削除できない場合があるため)。

コード例では `os.CreateTemp` で一時ファイルを作成・オープンし、
2つの `defer` で `Close` と `Remove` を登録しています。
その後、ファイルに書き込みを行っています。`main` 関数終了時に
`defer` が実行され、ファイルが削除・クローズされます。

`os.CreateTemp` は一時データ保存に便利ですが、
**`Close` と `Remove` 両方の `defer` による後片付けが非常に重要**です。