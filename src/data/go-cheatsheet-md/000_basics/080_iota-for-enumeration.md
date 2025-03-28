---
title: "`iota`: 連続する定数を簡単に作る魔法の言葉"
tags: ["basics", "定数", "const", "iota", "列挙型"]
---

`const()` ブロック内で連続した整数値を定数として定義したい場合、一つ一つ値を書くのは少し面倒です。Go言語には、このような場合に便利な `iota` という特別な識別子が用意されています。

`iota` は、`const` 宣言ブロック内で使われる**定数ジェネレータ**です。`iota` はそのブロック内で定数が宣言されるたびに `0` から始まり、一行下がるごとに `1` ずつ自動的に値が増加します。

## `iota` の基本的な使い方

```go title="iota の基本動作"
package main

import "fmt"

const (
	A = iota // iota は 0 から始まる
	B = iota // 次の行なので iota は 1 になる
	C = iota // 次の行なので iota は 2 になる
)

const (
	D = iota // 新しい const ブロックでは iota は再び 0 から始まる
	E        // 式が省略されると、上の行と同じ式 (iota) が適用される -> E = iota (値は 1)
	F        // 上の行と同じ式 (iota) が適用される -> F = iota (値は 2)
)

func main() {
	fmt.Println("--- ブロック 1 ---")
	fmt.Println("A:", A) // 0
	fmt.Println("B:", B) // 1
	fmt.Println("C:", C) // 2

	fmt.Println("\n--- ブロック 2 ---")
	fmt.Println("D:", D) // 0
	fmt.Println("E:", E) // 1
	fmt.Println("F:", F) // 2
}

/* 実行結果:
--- ブロック 1 ---
A: 0
B: 1
C: 2

--- ブロック 2 ---
D: 0
E: 1
F: 2
*/
```

**コード解説:**

*   `iota` は `const` ブロックの**最初の行で `0`** になります。
*   `const` ブロック内で**次の行に移る**と、`iota` の値は自動的に **`1` 増加**します。
*   `const` ブロックが**新しく始まる**と、`iota` の値は **`0` にリセット**されます。
*   `const` ブロック内で、ある行の式が省略されると、**直前の行と同じ式**が適用されます。上の例の `E` と `F` では、直前の `D = iota` の式 `iota` が適用され、その時点での `iota` の値（それぞれ 1 と 2）が設定されます。

## `iota` を使った列挙型のような定義

`iota` は、曜日、状態、カテゴリなど、連続した整数値で表現したい定数群（他の言語での**列挙型 (enum)** に似たもの）を定義するのに非常に便利です。

```go title="iota で曜日を定義する"
package main

import "fmt"

// 曜日を表す定数を iota で定義
const (
	Sunday = iota // iota = 0
	Monday        // iota = 1 (式が省略され、上の iota が適用される)
	Tuesday       // iota = 2
	Wednesday     // iota = 3
	Thursday      // iota = 4
	Friday        // iota = 5
	Saturday      // iota = 6
)

// iota を使って 1 から始まる連番を作ることも可能
const (
	First  = iota + 1 // iota = 0 なので、First = 0 + 1 = 1
	Second            // 式が省略され、上の iota + 1 が適用される (iota = 1 なので、Second = 1 + 1 = 2)
	Third             // iota = 2 なので、Third = 2 + 1 = 3
)

func main() {
	fmt.Println("--- 曜日 ---")
	fmt.Println("日曜日:", Sunday)     // 0
	fmt.Println("月曜日:", Monday)     // 1
	fmt.Println("火曜日:", Tuesday)    // 2
	fmt.Println("土曜日:", Saturday)   // 6

	fmt.Println("\n--- 1から始まる連番 ---")
	fmt.Println("1番目:", First)      // 1
	fmt.Println("2番目:", Second)     // 2
	fmt.Println("3番目:", Third)       // 3
}

/* 実行結果:
--- 曜日 ---
日曜日: 0
月曜日: 1
火曜日: 2
土曜日: 6

--- 1から始まる連番 ---
1番目: 1
2番目: 2
3番目: 3
*/
```

**コード解説:**

*   曜日の例では、`Sunday` に `iota` (値は 0) が設定され、続く `Monday` から `Saturday` までは式が省略されているため、暗黙的に `iota` が適用され、値が 1, 2, 3... とインクリメントされていきます。
*   連番の例では、最初の `First` で `iota + 1` という式を使っています。`iota` はこの行で `0` なので `First` は `1` になります。続く `Second` と `Third` では式が省略されているため、直前の `iota + 1` が適用されます。`Second` の行では `iota` は `1` なので `1 + 1 = 2`、`Third` の行では `iota` は `2` なので `2 + 1 = 3` となります。

`iota` を使うことで、連続する定数の定義を簡潔にし、マジックナンバー（コード中に直接書かれた意味不明な数値）を減らすことができます。