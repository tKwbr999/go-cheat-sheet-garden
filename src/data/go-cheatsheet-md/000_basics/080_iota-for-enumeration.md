## タイトル
title: `iota`: 連続する定数を簡単に作る魔法の言葉

## タグ
tags: ["basics", "定数", "const", "iota", "列挙型"]

## コード
```go
package main

import "fmt"

// iota は const ブロック内で 0 から始まり、行ごとに +1 される
const (
	A = iota // 0
	B = iota // 1
	C = iota // 2
)

// 式を省略すると直前の式が繰り返される
const (
	D = iota // 0
	E        // 1 (iota が繰り返される)
	F        // 2 (iota が繰り返される)
)

func main() {
	fmt.Println("Block 1:", A, B, C) // 0 1 2
	fmt.Println("Block 2:", D, E, F) // 0 1 2
}

```

## 解説
```text
`const()` ブロック内で連続した整数値を定数として定義したい場合に便利なのが **`iota`** です。`iota` は `const` 宣言ブロック内で使われる**定数ジェネレータ**です。

**基本動作:**
*   `iota` は `const` ブロックの最初の行で `0` にリセットされます (例: `A`, `D`)。
*   `const` ブロック内で次の行に移ると、`iota` の値は自動的に `1` 増加します (例: `B` は 1, `C` は 2)。
*   ある行の式が省略されると、直前の行と同じ式が適用されます。例の `E` と `F` では、直前の `D = iota` の式 `iota` が適用され、その時点での `iota` の値（それぞれ 1 と 2）が設定されます。

**応用例:**
`iota` は、曜日、状態、カテゴリなど、連続した整数値で表現したい定数群（他の言語での**列挙型 (enum)** に似たもの）を定義するのに非常に便利です。

```go
const (
    Sunday = iota // 0
    Monday        // 1
    Tuesday       // 2
    // ...
)
const (
    First = iota + 1 // 1
    Second           // 2
    Third            // 3
)
```

`iota` を使うことで、連続する定数の定義を簡潔にし、マジックナンバーを減らすことができます。