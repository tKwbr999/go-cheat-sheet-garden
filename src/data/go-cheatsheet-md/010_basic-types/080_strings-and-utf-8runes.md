## タイトル
title: 文字列と UTF-8 / Rune

## タグ
tags: ["basic-types", "文字列", "string", "rune", "UTF-8", "for range", "unicode/utf8"]

## コード
```go
package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	s := "Go言語" // 4文字

	fmt.Printf("文字列: \"%s\"\n", s)
	fmt.Printf("バイト長 (len): %d\n", len(s)) // 8

	runeCount := utf8.RuneCountInString(s)
	fmt.Printf("文字数 (RuneCount): %d\n", runeCount) // 4

	fmt.Println("\n--- バイト単位アクセス (for i) ---")
	for i := 0; i < len(s); i++ {
		fmt.Printf(" %d:%x", i, s[i])
	}
	fmt.Println()

	fmt.Println("\n--- 文字(Rune)単位アクセス (for range) ---")
	for i, r := range s {
		fmt.Printf(" %d:'%c'(%U)", i, r, r)
	}
	fmt.Println()
}
```

## 解説
```text
Goの文字列 (`string`) は内部的に
**UTF-8**エンコードされた**バイト (`byte`)** の
シーケンスです。日本語のようなマルチバイト文字を
扱う際にこの理解が重要です。

**バイト (Byte) vs 文字 (Rune):**
*   **バイト (`byte`)**: `uint8` の別名。文字列の構成要素。
*   **文字 (`rune`)**: `int32` の別名。
    一つの **Unicodeコードポイント** を表す。
    UTF-8では1文字が1〜4バイトで表現される。

**長さ vs 文字数:**
*   `len(s)`: 文字列 `s` の**バイト数**を返す。
*   `utf8.RuneCountInString(s)`: 文字列 `s` の
    **文字 (Rune) 数**を返す。
    (例: `"Go言語"` は `len` が 8、`RuneCount` が 4)

**反復処理:**
*   **バイト単位 (`for i := 0; i < len(s); i++`)**:
    `s[i]` で各バイトにアクセスできるが、
    マルチバイト文字は分割されてしまう。
*   **文字単位 (`for i, r := range s`)**:
    文字列を **Rune 単位**で反復処理する。
    `i` は Rune の開始バイトインデックス、
    `r` は Rune (`int32`) そのもの。
    **文字ごとに処理したい場合は `for range` を使う。**

**`[]rune` への変換:**
文字列 `s` を `[]rune(s)` と変換すると、
Rune のスライスが得られます。
これを使えば `runes[i]` で i 番目の**文字**に
アクセスできます。
ただし、変換にはメモリ確保とコピーが伴うため、
パフォーマンスに注意が必要です。
変更が必要な場合は `[]rune` に変換し、
操作後に `string()` で文字列に戻します。

目的に応じてバイト単位操作、文字単位操作、
`[]rune` 変換を使い分けましょう。