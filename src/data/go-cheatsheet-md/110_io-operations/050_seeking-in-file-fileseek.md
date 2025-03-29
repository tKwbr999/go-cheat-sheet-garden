## タイトル
title: I/O 操作: ファイル内の位置移動 (`file.Seek`)

## タグ
tags: ["io-operations", "io", "os", "file", "seek", "Seek", "SeekStart", "SeekCurrent", "SeekEnd", "オフセット"]

## コード
```go
package main

import (
	"fmt"
	"io" // Seek 定数
	"log"
	"os"
)

func main() {
	fileName := "example_seek.txt"
	// 事前にファイル作成: os.WriteFile(fileName, []byte("0123456789ABC..."), 0644)

	file, err := os.OpenFile(fileName, os.O_RDWR, 0644) // 読み書きで開く
	if err != nil { log.Fatal(err) }
	defer file.Close()

	buffer := make([]byte, 5)

	// 1. 先頭から 10 バイト目に移動 (SeekStart)
	newOffset, err := file.Seek(10, io.SeekStart)
	if err != nil { log.Fatal(err) }
	fmt.Printf("Seek(10, Start): Offset=%d\n", newOffset) // 10

	// 2. 現在位置から 5 バイト読み込む
	n, err := file.Read(buffer)
	if err != nil { log.Fatal(err) }
	fmt.Printf(" Read: %s\n", string(buffer[:n])) // ABCDE

	// 3. 末尾から 5 バイト前に移動 (SeekEnd)
	newOffset, err = file.Seek(-5, io.SeekEnd)
	if err != nil { log.Fatal(err) }
	fmt.Printf("Seek(-5, End): Offset=%d\n", newOffset) // 例: 31

	// 4. 現在位置から 5 バイト読み込む
	n, err = file.Read(buffer)
	if err != nil && err != io.EOF { log.Fatal(err) }
	fmt.Printf(" Read: %s\n", string(buffer[:n])) // VWXYZ

	// os.Remove(fileName) // 後片付け
}
```

## 解説
```text
ファイル内の特定の読み書き位置（オフセット）に
直接移動したい場合は **`Seek`** メソッドを使います。
`*os.File` は `io.Seeker` インターフェースを満たします。

**`file.Seek()` の使い方:**
`newOffset, err := file.Seek(offset int64, whence int)`
*   `offset`: 基準位置からの相対バイト数 (正/負)。
*   `whence`: 基準位置を指定する定数 (`io` パッケージ):
    *   `io.SeekStart` (0): ファイルの**先頭**基準。
    *   `io.SeekCurrent` (1): **現在位置**基準。
    *   `io.SeekEnd` (2): ファイルの**末尾**基準。
*   戻り値:
    *   `newOffset`: ファイル先頭からの**新しいオフセット位置**。
    *   `err`: エラー情報 (成功時は `nil`)。

コード例:
1. `Seek(10, io.SeekStart)`: 先頭から10バイト目に移動。
2. `Read(buffer)`: 現在位置(10)から5バイト読み込み ("ABCDE")。
   オフセットは15に進む。
3. `Seek(-5, io.SeekEnd)`: 末尾から5バイト前に移動。
4. `Read(buffer)`: 現在位置から5バイト読み込み ("VWXYZ")。

**(補足)** `Seek(offset, io.SeekCurrent)` で現在位置からの
相対移動も可能です。また、`Seek` で移動後に `Write` や
`WriteString` を呼び出すと、その位置からデータが**上書き**されます。

`Seek` は、ファイル内の任意の位置にアクセスしたい場合に役立ちます
(例: 固定長レコードファイル、特定部分の更新)。