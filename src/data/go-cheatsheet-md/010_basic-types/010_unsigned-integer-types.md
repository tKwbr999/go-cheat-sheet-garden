## タイトル
title: 符号なし整数 (Unsigned Integer)

## タグ
tags: ["basic-types", "整数", "uint", "byte", "uintptr"]

## コード
```go
package main

import "fmt"

func main() {
	var u uint = 100
	fmt.Printf("uint: %d\n", u)

	var u8 uint8 = 255
	fmt.Printf("uint8: %d\n", u8)

	var u16 uint16 = 65535
	fmt.Printf("uint16: %d\n", u16)

	var u32 uint32 = 4294967295
	fmt.Printf("uint32: %d\n", u32)

	var u64 uint64 = 18446744073709551615
	fmt.Printf("uint64: %d\n", u64)

	var b byte = 'A' // uint8 の別名
	fmt.Printf("byte: %d ('%c')\n", b, b)

	var ptr uintptr = 0xdeadbeef // 通常は使わない
	fmt.Printf("uintptr: %x\n", ptr)
}
```

## 解説
```text
**符号なし整数 (Unsigned Integer)** は、
**0 または正の整数**のみを扱う型です。
物の個数、データサイズなど、負の値に
ならない数値を扱う際に適しています。
符号付き整数と同じビット数でも、
より大きな正の値を格納できます。

**主な符号なし整数型:**
*   `uint`: サイズが実行環境に依存
    (32bit or 64bit)。
    負にならない一般的な整数に使います。
*   `uint8`, `uint16`, `uint32`, `uint64`:
    サイズが固定 (8, 16, 32, 64ビット)。
    扱える最大値は対応する符号付きの約2倍。
    ビット演算や特定サイズが必要な場合、
    非常に大きな正の整数が必要な場合に検討します。

**`byte` 型:**
`uint8` の**別名 (エイリアス)** です。
バイト列 (ファイルデータ等) を扱う際に
`[]byte` の形で非常によく使われます。
0から255までの値を表現します。

**`uintptr` 型:**
ポインタ (メモリアドレス) を整数として
表現するための特殊な型です。
サイズはポインタと同じ (32bit or 64bit)。
`unsafe` パッケージを使った低レベル操作で
使われますが、**通常の開発では
ほとんど使用しません**。

**使い分け:**
*   一般的な非負整数: `uint`
*   バイトデータ: `byte` (`uint8`)
*   特定ビット数/巨大な正の数: `uint16`〜`uint64`
*   通常使わない: `uintptr`