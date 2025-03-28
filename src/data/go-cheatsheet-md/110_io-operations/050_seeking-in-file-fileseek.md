---
title: "I/O 操作: ファイル内の位置移動 (`file.Seek`)"
tags: ["io-operations", "io", "os", "file", "seek", "Seek", "SeekStart", "SeekCurrent", "SeekEnd", "オフセット"]
---

ファイルを開いて `Read` や `Write` を行うと、通常はファイルの先頭から順に処理が進み、内部的に現在の読み書き位置（オフセット）が移動していきます。しかし、時にはファイルの特定の位置に直接移動して読み書きを開始したい場合があります。これを実現するのが **`Seek`** メソッドです。

`*os.File` は `io.Seeker` インターフェースを満たしており、`Seek` メソッドを持っています。

## `file.Seek()` の使い方

`Seek` メソッドは、ファイル内の次の読み書き位置（オフセット）を指定された位置に設定します。

**シグネチャ:** `func (f *File) Seek(offset int64, whence int) (int64, error)`

*   `offset`: 基準位置からの**相対的なバイト数**を指定します。正の値で前方へ、負の値で後方へ移動します。
*   `whence`: オフセットの計算の**基準となる位置**を指定する定数です。`io` パッケージで定義されています（Go 1.17 までは `os` パッケージでしたが、`io` パッケージの定数を使うのが推奨されます）。
    *   **`io.SeekStart` (または `0`)**: ファイルの**先頭**を基準とします。`offset` は 0 以上である必要があります。
    *   **`io.SeekCurrent` (または `1`)**: **現在の**読み書き位置を基準とします。`offset` は正でも負でも構いません。
    *   **`io.SeekEnd` (または `2`)**: ファイルの**末尾**を基準とします。`offset` は通常 0 以下です（末尾からの相対位置）。
*   戻り値:
    *   `int64`: ファイルの**先頭から**計算した**新しいオフセット位置**（バイト単位）。
    *   `error`: シーク操作中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

## コード例

```go title="file.Seek の使用例"
package main

import (
	"fmt"
	"io" // io.SeekStart, io.SeekCurrent, io.SeekEnd を使うため
	"log"
	"os"
)

func main() {
	// --- テスト用ファイルの準備 ---
	fileName := "example_seek.txt"
	fileContent := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	err := os.WriteFile(fileName, []byte(fileContent), 0644)
	if err != nil {
		log.Fatalf("テストファイルの書き込みに失敗: %v", err)
	}
	fmt.Printf("テストファイル '%s' を作成しました。\n内容: %s\n\n", fileName, fileContent)

	// --- ファイルを開く (読み書きモード) ---
	file, err := os.OpenFile(fileName, os.O_RDWR, 0644)
	if err != nil {
		log.Fatalf("ファイルオープン失敗: %v", err)
	}
	defer file.Close()

	// --- Seek の例 ---
	buffer := make([]byte, 5) // 読み込み用バッファ (5バイト)

	// 1. 先頭から 10 バイト目に移動 (文字 'A' の位置)
	newOffset, err := file.Seek(10, io.SeekStart)
	if err != nil { log.Fatalf("Seek(10, Start) 失敗: %v", err) }
	fmt.Printf("1. Seek(10, SeekStart): 新しいオフセット = %d\n", newOffset)

	// 2. 現在位置から 5 バイト読み込む
	bytesRead, err := file.Read(buffer)
	if err != nil { log.Fatalf("Read 失敗: %v", err) }
	fmt.Printf("   Read (%d bytes): %s\n", bytesRead, string(buffer[:bytesRead])) // "ABCDE"

	// 3. 現在位置 (15) から -8 バイト移動 (文字 '7' の位置)
	newOffset, err = file.Seek(-8, io.SeekCurrent)
	if err != nil { log.Fatalf("Seek(-8, Current) 失敗: %v", err) }
	fmt.Printf("3. Seek(-8, SeekCurrent): 新しいオフセット = %d\n", newOffset) // 15 - 8 = 7

	// 4. 現在位置から 3 バイト読み込む
	bytesRead, err = file.Read(buffer[:3]) // バッファの一部を使う
	if err != nil { log.Fatalf("Read 失敗: %v", err) }
	fmt.Printf("   Read (%d bytes): %s\n", bytesRead, string(buffer[:bytesRead])) // "789"

	// 5. 末尾から 5 バイト前に移動 (文字 'V' の位置)
	newOffset, err = file.Seek(-5, io.SeekEnd)
	if err != nil { log.Fatalf("Seek(-5, End) 失敗: %v", err) }
	fmt.Printf("5. Seek(-5, SeekEnd): 新しいオフセット = %d\n", newOffset) // 36 - 5 = 31

	// 6. 現在位置から最後まで読み込む
	remainingBytes, err := io.ReadAll(file) // io.ReadAll は現在の位置から最後まで読む
	if err != nil { log.Fatalf("ReadAll 失敗: %v", err) }
	fmt.Printf("   ReadAll (%d bytes): %s\n", len(remainingBytes), string(remainingBytes)) // "VWXYZ"

	// 7. 先頭に戻って一部を上書きする
	newOffset, err = file.Seek(0, io.SeekStart) // 先頭 (0) に移動
	if err != nil { log.Fatalf("Seek(0, Start) 失敗: %v", err) }
	fmt.Printf("7. Seek(0, SeekStart): 新しいオフセット = %d\n", newOffset)
	bytesWritten, err := file.WriteString("ZERO") // "0123" を "ZERO" で上書き
	if err != nil { log.Fatalf("WriteString 失敗: %v", err) }
	fmt.Printf("   WriteString (%d bytes): \"ZERO\"\n", bytesWritten)

	// --- 後片付け ---
	file.Close() // Remove 前に明示的に閉じる
	// 確認のため再度読み込み
	finalContent, _ := os.ReadFile(fileName)
	fmt.Printf("\n最終的なファイル内容: %s\n", string(finalContent)) // "ZERO456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	os.Remove(fileName)
}

/* 実行結果:
テストファイル 'example_seek.txt' を作成しました。
内容: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ

1. Seek(10, SeekStart): 新しいオフセット = 10
   Read (5 bytes): ABCDE
3. Seek(-8, SeekCurrent): 新しいオフセット = 7
   Read (3 bytes): 789
5. Seek(-5, SeekEnd): 新しいオフセット = 31
   ReadAll (5 bytes): VWXYZ
7. Seek(0, SeekStart): 新しいオフセット = 0
   WriteString (4 bytes): "ZERO"

最終的なファイル内容: ZERO456789ABCDEFGHIJKLMNOPQRSTUVWXYZ
*/
```

**コード解説:**

*   `file.Seek(10, io.SeekStart)`: ファイルの先頭から10バイト目にオフセットを移動します。
*   `file.Read(buffer)`: 現在のオフセット（10）からバッファサイズ（5バイト）分読み込みます。オフセットは15に進みます。
*   `file.Seek(-8, io.SeekCurrent)`: 現在のオフセット（15）から8バイト戻り、オフセットを7に設定します。
*   `file.Read(buffer[:3])`: 現在のオフセット（7）から3バイト読み込みます。オフセットは10に進みます。
*   `file.Seek(-5, io.SeekEnd)`: ファイルの末尾（36バイト目）から5バイト戻り、オフセットを31に設定します。
*   `io.ReadAll(file)`: 現在のオフセット（31）からファイルの最後までを読み込みます。
*   `file.Seek(0, io.SeekStart)`: オフセットをファイルの先頭 (0) に戻します。
*   `file.WriteString("ZERO")`: 現在のオフセット（0）から文字列 "ZERO" を書き込みます。これにより、元の "0123" が上書きされます。

`Seek` メソッドを使うことで、ファイル内の任意の位置にアクセスして読み書きを行うことができます。これは、固定長のレコードファイルや、ファイルの特定の部分だけを更新したい場合などに役立ちます。