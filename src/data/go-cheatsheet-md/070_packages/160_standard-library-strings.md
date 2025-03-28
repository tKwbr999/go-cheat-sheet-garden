---
title: "標準ライブラリ: `strings` パッケージ (文字列操作)"
tags: ["packages", "standard library", "strings", "文字列操作", "Contains", "HasPrefix", "Index", "Join", "Split", "ToLower", "ToUpper", "TrimSpace"]
---

Go言語で文字列 (`string`) を扱う際、検索、置換、分割、結合、大文字/小文字変換など、様々な操作が必要になります。これらの基本的な文字列操作機能を提供してくれるのが、標準ライブラリの **`strings`** パッケージです。

`import "strings"` として利用します。

## よく使われる `strings` 関数の例

`strings` パッケージには多くの便利な関数がありますが、ここでは特によく使われるものをいくつか紹介します。

*   **`strings.Contains(s, substr string) bool`**: 文字列 `s` の中に部分文字列 `substr` が含まれているかどうかを返します (`true` / `false`)。
*   **`strings.HasPrefix(s, prefix string) bool`**: 文字列 `s` が指定された `prefix` で始まっているかどうかを返します。
*   **`strings.HasSuffix(s, suffix string) bool`**: 文字列 `s` が指定された `suffix` で終わっているかどうかを返します。
*   **`strings.Index(s, substr string) int`**: 文字列 `s` の中で部分文字列 `substr` が最初に現れるインデックス（バイト位置）を返します。見つからない場合は `-1` を返します。
*   **`strings.Join(elems []string, sep string) string`**: 文字列スライス `elems` の要素を、区切り文字 `sep` で連結した新しい文字列を返します。
*   **`strings.Split(s, sep string) []string`**: 文字列 `s` を区切り文字 `sep` で分割し、文字列スライスとして返します。
*   **`strings.ToLower(s string) string`**: 文字列 `s` をすべて小文字に変換した新しい文字列を返します。
*   **`strings.ToUpper(s string) string`**: 文字列 `s` をすべて大文字に変換した新しい文字列を返します。
*   **`strings.TrimSpace(s string) string`**: 文字列 `s` の先頭と末尾にある空白文字（スペース、タブ、改行など）を取り除いた新しい文字列を返します。
*   **`strings.Replace(s, old, new string, n int) string`**: 文字列 `s` 内の `old` 文字列を `new` 文字列に置換します。`n` は置換する回数を指定します (`n < 0` ならすべて置換)。
*   **`strings.NewReader(s string) *Reader`**: 文字列 `s` から読み取るための `io.Reader` を作成します。ファイルなどと同じように文字列を扱いたい場合に便利です。
*   **`strings.Builder`**: 複数の文字列を効率的に連結するための型（`010_basic-types/070_string-concatenation.md` で説明済み）。

## コード例

```go title="strings パッケージの使用例"
package main

import (
	"fmt"
	"strings" // strings パッケージをインポート
)

func main() {
	s := " Hello, World! Go is fun! "
	fmt.Printf("元の文字列: \"%s\"\n", s)

	// --- 検索・判定 ---
	fmt.Println("\n--- 検索・判定 ---")
	fmt.Printf("Contains(\"World\"): %t\n", strings.Contains(s, "World")) // true
	fmt.Printf("Contains(\"Gopher\"): %t\n", strings.Contains(s, "Gopher")) // false
	fmt.Printf("HasPrefix(\" Hello\"): %t\n", strings.HasPrefix(s, " Hello")) // true
	fmt.Printf("HasSuffix(\"fun! \"): %t\n", strings.HasSuffix(s, "fun! ")) // true
	fmt.Printf("Index(\"Go\"): %d\n", strings.Index(s, "Go")) // "Go" が始まるバイトインデックス (15)
	fmt.Printf("Index(\"Python\"): %d\n", strings.Index(s, "Python")) // 見つからないので -1

	// --- 分割・結合 ---
	fmt.Println("\n--- 分割・結合 ---")
	csv := "apple,banana,cherry"
	parts := strings.Split(csv, ",") // "," で分割
	fmt.Printf("Split(\"%s\", \",\"): %q\n", csv, parts) // ["apple" "banana" "cherry"]

	joined := strings.Join(parts, "-") // スライス要素を "-" で結合
	fmt.Printf("Join(%q, \"-\"): \"%s\"\n", parts, joined) // "apple-banana-cherry"

	// --- 変換・トリム ---
	fmt.Println("\n--- 変換・トリム ---")
	lower := strings.ToLower(s)
	fmt.Printf("ToLower: \"%s\"\n", lower) // " hello, world! go is fun! "
	upper := strings.ToUpper(s)
	fmt.Printf("ToUpper: \"%s\"\n", upper) // " HELLO, WORLD! GO IS FUN! "
	trimmed := strings.TrimSpace(s)
	fmt.Printf("TrimSpace: \"%s\"\n", trimmed) // "Hello, World! Go is fun!"

	// --- 置換 ---
	fmt.Println("\n--- 置換 ---")
	replaced := strings.Replace(s, " ", "_", -1) // すべてのスペースを "_" に置換 (-1 はすべて置換)
	fmt.Printf("Replace (all spaces): \"%s\"\n", replaced)
	replacedOnce := strings.Replace(s, " ", "_", 1) // 最初のスペースだけを "_" に置換
	fmt.Printf("Replace (first space): \"%s\"\n", replacedOnce)
}

/* 実行結果:
元の文字列: " Hello, World! Go is fun! "

--- 検索・判定 ---
Contains("World"): true
Contains("Gopher"): false
HasPrefix(" Hello"): true
HasSuffix("fun! "): true
Index("Go"): 15
Index("Python"): -1

--- 分割・結合 ---
Split("apple,banana,cherry", ","): ["apple" "banana" "cherry"]
Join(["apple" "banana" "cherry"], "-"): "apple-banana-cherry"

--- 変換・トリム ---
ToLower: " hello, world! go is fun! "
ToUpper: " HELLO, WORLD! GO IS FUN! "
TrimSpace: "Hello, World! Go is fun!"

--- 置換 ---
Replace (all spaces): "_Hello,_World!_Go_is_fun!_"
Replace (first space): "_Hello, World! Go is fun! "
*/
```

`strings` パッケージは、Goで文字列を扱う上で基本となる多くの機能を提供します。他にも様々な関数があるので、必要に応じて公式ドキュメント ([https://pkg.go.dev/strings](https://pkg.go.dev/strings)) を参照すると良いでしょう。