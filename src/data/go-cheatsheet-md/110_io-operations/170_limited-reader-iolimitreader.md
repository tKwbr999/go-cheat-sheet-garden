---
title: "I/O 操作: 読み込みサイズの制限 (`io.LimitReader`)"
tags: ["io-operations", "io", "LimitReader", "Reader", "制限", "セキュリティ"]
---

`io.Reader` からデータを読み込む際に、読み取るデータの合計サイズに**上限**を設けたい場合があります。例えば、信頼できないソースからのデータ読み込み時に、予期せず大量のデータを読み込んでメモリを使い果たしてしまうのを防いだり、プロトコル上サイズが決まっている部分だけを読み取ったりする場合などです。

このような場合に `io` パッケージの **`LimitReader`** 関数が役立ちます。

`import "io"` として利用します。

## `io.LimitReader()` の使い方

`io.LimitReader()` は、元の `io.Reader` (`r`) と最大読み取りバイト数 (`n`) を引数に取り、最大で `n` バイトまでしか読み取れない新しい `io.Reader` を返します。

**構文:** `lr := io.LimitReader(r Reader, n int64)`

*   `r`: 元となる `io.Reader`。
*   `n`: この Reader から読み取れる最大バイト数 (`int64`)。
*   戻り値 `lr`: `*io.LimitedReader` 型のポインタ。これも `io.Reader` インターフェースを満たします。
    *   `lr` から `Read` を呼び出すと、内部的に `r` からデータが読み込まれますが、合計の読み取りバイト数が `n` に達すると、それ以降の `Read` 呼び出しは `0` バイト読み込みと `io.EOF` を返すようになります。
    *   元の Reader `r` が `n` バイト読み込む前に EOF に達した場合も、`lr` は `io.EOF` を返します。

## コード例

```go title="io.LimitReader の使用例"
package main

import (
	"fmt"
	"io" // io.LimitReader, io.ReadAll, io.EOF を使うため
	"log"
	"strings"
)

func main() {
	originalData := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	reader := strings.NewReader(originalData) // 元の Reader

	// --- LimitReader で最大 15 バイトに制限 ---
	fmt.Println("--- 最大 15 バイト読み込み ---")
	// reader から最大 15 バイトまで読み取れる LimitedReader を作成
	limitReader15 := io.LimitReader(reader, 15)

	// ReadAll で読み込んでみる (最大 15 バイトしか読めないはず)
	data15, err := io.ReadAll(limitReader15)
	if err != nil {
		log.Fatalf("ReadAll(limitReader15) 失敗: %v", err)
	}
	fmt.Printf("読み込んだデータ (%d bytes): %s\n", len(data15), string(data15)) // "0123456789ABCDE"

	// --- さらに読み込もうとしても EOF になる ---
	fmt.Println("\n--- さらに読み込み試行 ---")
	// limitReader15 は既に 15 バイト読み込んだので、次は EOF を返す
	n, err := limitReader15.Read([]byte{0}) // 0 バイト読み込み試行
	fmt.Printf("読み込みバイト=%d, エラー=%v\n", n, err) // エラーは io.EOF

	// --- 元の Reader の状態 ---
	// LimitReader を介して読み込んだ分だけ、元の Reader の位置も進んでいる
	fmt.Println("\n--- 元の Reader から読み込み ---")
	remainingData, err := io.ReadAll(reader) // 元の Reader から残りを読み込む
	if err != nil {
		log.Fatalf("ReadAll(reader) 失敗: %v", err)
	}
	fmt.Printf("元の Reader の残り (%d bytes): %s\n", len(remainingData), string(remainingData)) // "FGHIJKLMNOPQRSTUVWXYZ"

	// --- CopyN との比較 ---
	// io.CopyN(dst, src, n) も最大 n バイトをコピーするが、
	// LimitReader は Reader 自体の読み取り上限を設定する点が異なる。
}

/* 実行結果:
--- 最大 15 バイト読み込み ---
読み込んだデータ (15 bytes): 0123456789ABCDE

--- さらに読み込み試行 ---
読み込みバイト=0, エラー=EOF

--- 元の Reader から読み込み ---
元の Reader の残り (21 bytes): FGHIJKLMNOPQRSTUVWXYZ
*/
```

**コード解説:**

*   `reader := strings.NewReader(originalData)`: 元となるデータを持つ Reader を作成します。
*   `limitReader15 := io.LimitReader(reader, 15)`: `reader` から最大で 15 バイトまでしか読み取れない新しい Reader `limitReader15` を作成します。
*   `io.ReadAll(limitReader15)`: `limitReader15` から読み込みます。内部では `reader` から読み込みますが、合計が 15 バイトに達した時点で `io.EOF` が返されるため、`data15` には最初の 15 バイトだけが格納されます。
*   `limitReader15.Read([]byte{0})`: 既に上限まで読み込んでいるため、この呼び出しは `0, io.EOF` を返します。
*   `io.ReadAll(reader)`: 元の `reader` から残りのデータを読み込みます。`LimitReader` を介して 15 バイトが既に消費されているため、16 バイト目以降のデータが読み込まれます。

`io.LimitReader` は、HTTP リクエストボディのサイズ制限、特定のフォーマットのヘッダー部分のみの読み取り、信頼できない入力ソースからの保護など、読み込むデータ量を制御する必要がある場合に役立ちます。