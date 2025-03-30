## タイトル
title: `for range` ループ (配列, スライス, 文字列)

## タグ
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "配列", "スライス", "文字列", "rune"]

## コード
```go
package main

import "fmt"

func main() {
	// 配列の例
	primes := [4]int{2, 3, 5, 7}
	fmt.Println("--- 配列の for range ---")
	for index, value := range primes {
		fmt.Printf("インデックス %d: 値 %d\n", index, value)
	}

	// 値だけが必要な場合 (インデックスを _ で無視)
	fmt.Println("\n--- 値だけを使う場合 ---")
	sum := 0
	nums := []int{10, 20, 30} // スライス
	for _, num := range nums {
		sum += num
	}
	fmt.Printf("合計: %d\n", sum)

	// インデックスだけが必要な場合
	// for i := range nums { fmt.Println(i) }
}

```

## 解説
```text
Goの `for` 文には、配列、スライス、文字列などの
**コレクション**の要素を順番に取り出して処理する
**`for range`** 形式があります。

**基本構文 (配列, スライス, 文字列):**
`for インデックス変数, 値変数 := range コレクション { ... }`
各反復で**インデックス**とその位置の**要素の値**の
ペアが返されます。

**配列・スライスでの利用:**
0番目の要素から順にインデックスと値が返されます。
*   ループ変数名 (`index`, `value` 等) は自由。
*   インデックスか値の一方が不要な場合は `_` で無視できます。
    (例: `for _, num := range nums`)
*   値の変数を省略するとインデックスのみ返されます。
    (例: `for i := range nums`)

**文字列での利用:**
文字列に `for range` を使うと、バイト単位ではなく
**文字 (Rune) 単位**で反復処理が行われます。
*   1番目の変数 (`i`) には Rune の開始**バイトインデックス**。
*   2番目の変数 (`r`) には Rune (Unicodeコードポイント, `int32`)。
マルチバイト文字を正しく扱う場合に重要です。
(例: `for i, r := range "Go言語"`)

`for range` はコレクションの要素を安全かつ簡単に
処理するための強力なツールです。