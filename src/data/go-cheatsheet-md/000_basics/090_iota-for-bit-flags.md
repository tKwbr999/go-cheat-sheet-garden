## タイトル
title: `iota` とビット演算: ビットフラグを賢く定義する

## タグ
tags: ["basics", "定数", "const", "iota", "ビット演算", "ビットフラグ"]

## コード
```go
package main

import "fmt"

// iota とビットシフトでビットフラグを定義
const (
	Readable   = 1 << iota // 1 (001)
	Writable   = 1 << iota // 2 (010)
	Executable = 1 << iota // 4 (100)
)

func main() {
	// フラグを組み合わせる (ビットOR)
	readWrite := Readable | Writable // 1 | 2 = 3 (011)
	fmt.Println("ReadWrite:", readWrite)

	// 特定のフラグが立っているか確認 (ビットAND)
	canWrite := (readWrite & Writable) != 0   // (3 & 2) != 0 -> true
	canExecute := (readWrite & Executable) != 0 // (3 & 4) != 0 -> false

	fmt.Println("Can Write:", canWrite)
	fmt.Println("Can Execute:", canExecute)
}

```

## 解説
```text
`iota` はビット演算と組み合わせることで、**ビットフラグ**を簡潔に表現するためにも使われます。ビットフラグは、複数の ON/OFF 状態を一つの整数値で効率的に管理する方法です。

2進数の各桁を独立したスイッチとして利用します。
例: ファイル権限
*   Readable:   1 (2進数 `001`)
*   Writable:   2 (2進数 `010`)
*   Executable: 4 (2進数 `100`)
これらは ON のビット位置が重ならない2のべき乗です。

**`iota` とビットシフト `<<` で定義:**
`1 << iota` を使うと、`const` ブロック内で `iota` が 0, 1, 2 と増えるにつれて、1, 2, 4 という2のべき乗が簡単に生成できます。

**フラグの操作:**
*   **`|` (ビットOR):** フラグを組み合わせる。
    `Readable | Writable` (`001 | 010`) は `011` (3) となり、「読み書き可能」を表す。
*   **`&` (ビットAND):** 特定フラグが立っているか確認。
    `permissions & Writable` の結果が 0 でなければ `Writable` フラグが立っている。

コード例では、`readWrite` は `Readable` と `Writable` のフラグが立った状態 (3) です。`readWrite & Writable` は 0 ではないので `canWrite` は `true`、`readWrite & Executable` は 0 なので `canExecute` は `false` になります。

`iota` とビットシフトの組み合わせは、ビットフラグ定義を簡潔かつ明確にするのに役立ちます。