---
title: "基本の型: 文字列と UTF-8 / Rune"
tags: ["basic-types", "文字列", "string", "rune", "UTF-8", "for range", "unicode/utf8"]
---

Goの文字列 (`string`) は、内部的には**UTF-8**エンコードされた**バイト (byte)** のシーケンス（並び）として格納されています。このことを理解することは、特に日本語のようなマルチバイト文字を扱う際に重要になります。

## バイト (Byte) vs 文字 (Rune)

*   **バイト (Byte):** Goの `byte` 型は `uint8` の別名で、8ビットの符号なし整数です。文字列はこれらのバイトの集まりです。ASCII文字（アルファベット、数字など）は通常1バイトで表現されます。
*   **文字 (Rune):** Goの `rune` 型は `int32` の別名で、一つの**Unicodeコードポイント**を表します。Unicodeは世界中の文字を表現するための標準規格で、各文字に一意の番号（コードポイント）が割り当てられています。日本語のひらがな、カタカナ、漢字などは、UTF-8エンコーディングでは通常2バイト以上（多くは3バイト）を使って表現されます。

つまり、Goの文字列はバイトの集まりですが、そのバイト列がUTF-8ルールに従って解釈されることで、様々な文字（Rune）を表現しています。

## 文字列の長さ vs 文字数

前のセクションで見たように、`len(s)` は文字列 `s` の**バイト数**を返します。文字列に含まれる**文字数**を知りたい場合は、`unicode/utf8` パッケージの `RuneCountInString()` 関数を使います。

## 文字列の反復処理: `for range`

文字列に対して `for range` ループを使うと、バイト単位ではなく**文字 (Rune) 単位**で反復処理が行われます。

*   ループ変数の1つ目 (`i`) には、その文字 (Rune) が始まる**バイトインデックス**が入ります。
*   ループ変数の2つ目 (`r`) には、その文字の **Rune (Unicodeコードポイント、`int32`)** が入ります。

```go title="文字列の反復処理: バイト vs Rune"
package main

import (
	"fmt"
	"unicode/utf8" // UTF-8 と rune 関連の関数を含むパッケージ
)

func main() {
	s := "Go言語" // "G", "o", "言", "語" の4文字

	fmt.Printf("文字列: \"%s\"\n", s)
	fmt.Printf("バイト長 (len): %d\n", len(s)) // G(1) + o(1) + 言(3) + 語(3) = 8

	// 文字数 (Rune数) を数える
	runeCount := utf8.RuneCountInString(s)
	fmt.Printf("文字数 (RuneCountInString): %d\n", runeCount) // 4

	fmt.Println("\n--- バイト単位でのアクセス (インデックス) ---")
	// インデックスアクセスはバイト単位
	for i := 0; i < len(s); i++ {
		// %x は16進数表示, %c は文字表示 (マルチバイト文字は正しく表示されない)
		fmt.Printf("バイトインデックス %d: %x (%c)\n", i, s[i], s[i])
	}
	// 出力を見ると、'言' や '語' が3バイトで構成されていることがわかる

	fmt.Println("\n--- 文字 (Rune) 単位でのアクセス (for range) ---")
	// for range は文字列を Rune 単位で反復処理する
	// i は各 Rune の開始バイトインデックス、r は Rune (int32) そのもの
	for i, r := range s {
		// %c は Rune を文字として表示, %U は Unicode コードポイント (U+XXXX 形式)
		fmt.Printf("バイトインデックス %d: Rune '%c' (Unicode: %U, バイトサイズ: %d)\n",
			i, r, r, utf8.RuneLen(r)) // utf8.RuneLen で Rune のバイトサイズがわかる
	}
	// '言' はバイトインデックス 2 から始まり、3バイト
	// '語' はバイトインデックス 5 から始まり、3バイト
}

/* 実行結果:
文字列: "Go言語"
バイト長 (len): 8
文字数 (RuneCountInString): 4

--- バイト単位でのアクセス (インデックス) ---
バイトインデックス 0: 47 (G)
バイトインデックス 1: 6f (o)
バイトインデックス 2: e8 (è)
バイトインデックス 3: a8 (¨)
バイトインデックス 4: 80 (€)
バイトインデックス 5: e8 (è)
バイトインデックス 6: aa (ª)
バイトインデックス 7: 9e (ž)

--- 文字 (Rune) 単位でのアクセス (for range) ---
バイトインデックス 0: Rune 'G' (Unicode: U+0047, バイトサイズ: 1)
バイトインデックス 1: Rune 'o' (Unicode: U+006F, バイトサイズ: 1)
バイトインデックス 2: Rune '言' (Unicode: U+8A00, バイトサイズ: 3)
バイトインデックス 5: Rune '語' (Unicode: U+8A9E, バイトサイズ: 3)
*/
```

## 文字単位でのインデックスアクセス: `[]rune` への変換

文字列を `[]rune` (Runeのスライス) に変換すると、文字単位でのインデックスアクセスが可能になります。ただし、この変換は新しいメモリ確保とコピーを伴うため、パフォーマンスが重要な場面では注意が必要です。

```go title="[]rune への変換とアクセス"
package main

import "fmt"

func main() {
	s := "Go言語"
	fmt.Printf("元の文字列: \"%s\"\n", s)

	// 文字列を []rune に変換
	runes := []rune(s)

	fmt.Printf("[]rune の長さ (文字数): %d\n", len(runes)) // 4

	// []rune に対してインデックスアクセスすると、文字 (Rune) が得られる
	fmt.Printf("runes[0]: '%c'\n", runes[0]) // 'G'
	fmt.Printf("runes[1]: '%c'\n", runes[1]) // 'o'
	fmt.Printf("runes[2]: '%c'\n", runes[2]) // '言'
	fmt.Printf("runes[3]: '%c'\n", runes[3]) // '語'

	// runes[2] = '話' // []rune は変更可能 (文字列とは異なる)
	// fmt.Printf("変更後の runes[2]: '%c'\n", runes[2])

	// []rune から文字列に戻す
	backToString := string(runes)
	fmt.Printf("[]rune から戻した文字列: \"%s\"\n", backToString)
}

/* 実行結果:
元の文字列: "Go言語"
[]rune の長さ (文字数): 4
runes[0]: 'G'
runes[1]: 'o'
runes[2]: '言'
runes[3]: '語'
[]rune から戻した文字列: "Go言語"
*/
```

Goの文字列はバイトシーケンスであり、UTF-8でエンコードされているという点を理解し、目的に応じてバイト単位の操作 (`len`, `s[i]`)、文字単位の操作 (`for range`, `utf8.RuneCountInString`)、あるいは `[]rune` への変換を使い分けることが重要です。