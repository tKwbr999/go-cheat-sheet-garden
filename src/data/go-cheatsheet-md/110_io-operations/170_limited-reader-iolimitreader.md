## タイトル
title: I/O 操作: 読み込みサイズの制限 (`io.LimitReader`)

## タグ
tags: ["io-operations", "io", "LimitReader", "Reader", "制限", "セキュリティ"]

## コード
```go
package main

import (
	"fmt"
	"io"
	"log"
	"strings"
)

func main() {
	originalData := "0123456789ABCDEFGHIJ" // 20バイトのデータ
	reader := strings.NewReader(originalData)

	// LimitReader で最大 15 バイトに制限
	limitReader := io.LimitReader(reader, 15)

	// ReadAll で読み込む (最大15バイトしか読めない)
	data, err := io.ReadAll(limitReader)
	if err != nil {
		log.Fatalf("ReadAll failed: %v", err)
	}
	fmt.Printf("Read (%d bytes): %s\n", len(data), string(data)) // 15バイト

	// さらに読み込もうとしても EOF になる
	// n, err := limitReader.Read([]byte{0}) // n=0, err=io.EOF

	// 元の reader は 15 バイト分進んでいる
	// remaining, _ := io.ReadAll(reader) // "FGHIJ" が読める
}

```

## 解説
```text
`io.Reader` から読み込むデータ量に**上限**を設けたい場合、
`io` パッケージの **`LimitReader`** 関数が役立ちます。
信頼できないソースからの過剰な読み込み防止などに使えます。
`import "io"` で利用します。

**使い方:**
`lr := io.LimitReader(r Reader, n int64)`
*   `r`: 元の `io.Reader`。
*   `n`: 最大読み取りバイト数 (`int64`)。
*   `lr`: 新しい `io.Reader` (`*io.LimitedReader`)。
    `lr` からの合計読み取りバイト数が `n` に達すると、
    それ以降の `Read` は `0, io.EOF` を返すようになります。

コード例では、`strings.NewReader` を `io.LimitReader` でラップし、
最大読み取りバイト数を 15 に制限しています。
`io.ReadAll(limitReader)` を呼び出すと、15 バイト読み込んだ時点で
`limitReader` が `EOF` を返すため、結果の `data` には
最初の 15 バイトのみが格納されます。

`LimitReader` を介して読み込んだ分だけ、元の `Reader` (`reader`) の
読み取り位置も進みます。

**(io.CopyN との比較)**
`io.CopyN(dst, src, n)` はコピー操作のバイト数を制限しますが、
`io.LimitReader(src, n)` は `Reader` 自体の読み取り能力を
制限する点が異なります。

`io.LimitReader` は、HTTP リクエストボディのサイズ制限や、
特定のフォーマットのヘッダー部分のみ読み取りたい場合などに便利です。