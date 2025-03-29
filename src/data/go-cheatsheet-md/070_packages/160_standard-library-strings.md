## タイトル
title: 標準ライブラリ: `strings` パッケージ (文字列操作)

## タグ
tags: ["packages", "standard library", "strings", "文字列操作", "Contains", "HasPrefix", "Index", "Join", "Split", "ToLower", "ToUpper", "TrimSpace"]

## コード
```go
package main

import (
	"fmt"
	"strings" // strings パッケージ
)

func main() {
	s := " Hello, World! Go is fun! "
	fmt.Printf("元: \"%s\"\n", s)

	// 検索・判定
	fmt.Println("Contains(\"Go\"):", strings.Contains(s, "Go")) // true
	// fmt.Println("HasPrefix:", strings.HasPrefix(s, " Hello")) // true
	// fmt.Println("Index:", strings.Index(s, "Go")) // 15

	// 分割・結合
	csv := "a,b,c"
	parts := strings.Split(csv, ",")
	fmt.Printf("Split: %q\n", parts) // ["a" "b" "c"]
	joined := strings.Join(parts, "-")
	fmt.Printf("Join: \"%s\"\n", joined) // "a-b-c"

	// 変換・トリム
	fmt.Println("ToLower:", strings.ToLower(s))
	fmt.Println("ToUpper:", strings.ToUpper(s))
	fmt.Println("TrimSpace:", strings.TrimSpace(s))

	// 置換
	fmt.Println("Replace:", strings.Replace(s, " ", "_", -1)) // 全置換
}

```

## 解説
```text
**`strings`** パッケージは、文字列 (`string`) の
検索、置換、分割、結合、大文字/小文字変換など、
基本的な文字列操作機能を提供します。
`import "strings"` で利用します。

**よく使われる関数:**
*   `Contains(s, substr)`: `s` に `substr` が含まれるか。
*   `HasPrefix(s, prefix)`: `s` が `prefix` で始まるか。
*   `HasSuffix(s, suffix)`: `s` が `suffix` で終わるか。
*   `Index(s, substr)`: `substr` が最初に現れる位置 (バイト)。なければ -1。
*   `Join(elems []string, sep)`: スライス要素を `sep` で連結。
*   `Split(s, sep)`: `s` を `sep` で分割しスライスを返す。
*   `ToLower(s)`: 小文字に変換。
*   `ToUpper(s)`: 大文字に変換。
*   `TrimSpace(s)`: 前後の空白を除去。
*   `Replace(s, old, new, n)`: `old` を `new` に `n` 回置換 (`n<0` で全て)。
*   `NewReader(s)`: 文字列から読み取る `io.Reader` を作成。
*   `Builder`: 効率的な文字列連結用 (別項参照)。

コード例ではこれらの基本的な関数の使い方を示しています。
`strings` パッケージはGoでの文字列処理の基本です。
詳細は公式ドキュメントを参照してください。