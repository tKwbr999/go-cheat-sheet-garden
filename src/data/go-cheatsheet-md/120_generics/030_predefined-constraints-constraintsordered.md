## タイトル
title: 定義済みの型制約 (`comparable`, `cmp.Ordered`)

## タグ
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "comparable", "cmp", "Ordered", "比較", "順序付け"]

## コード
```go
package main

import (
	"cmp" // Go 1.21+
	"fmt"
)

// ジェネリック関数 Max: T は順序付け可能 (Ordered) である必要がある
func Max[T cmp.Ordered](a, b T) T {
	if a > b { // > 演算子が使える
		return a
	}
	return b
}

func main() {
	fmt.Println("Max(10, 5):", Max(10, 5))         // int
	fmt.Println("Max(3.14, 2.7):", Max(3.14, 2.7)) // float64
	fmt.Println("Max(\"A\", \"B\"):", Max("A", "B")) // string

	// --- comparable の例 (参考) ---
	// func MapKeys[K comparable, V any](m map[K]V) []K { ... }
	// m := map[string]int{"a": 1}
	// keys := MapKeys(m) // OK: string は comparable

	// --- エラー例 ---
	// Max([]int{1}, []int{2}) // コンパイルエラー (スライスは Ordered ではない)
}

```

## 解説
```text
よく使われる型制約は Go で事前に定義されています。

**`comparable` 制約:**
*   言語組み込み (Go 1.18+)。
*   `==`, `!=` で比較可能な型を許可
    (数値, 文字列, ポインタ, チャネル, インターフェース,
     比較可能な要素/フィールドを持つ配列/構造体)。
*   **スライス, マップ, 関数は不可**。
*   **用途:** マップのキー (`map[K comparable]V`) など。

**`cmp.Ordered` 制約 (Go 1.21+):**
*   標準ライブラリ `cmp` パッケージ (`import "cmp"`)。
    (Go 1.18-1.20 は `golang.org/x/exp/constraints.Ordered`)
*   **順序付け可能** (`<`, `<=`, `>`, `>=`) な型を許可。
*   具体的には**整数型、浮動小数点数型、文字列型**。
*   **用途:** ジェネリックな Min/Max 関数、ソートなど。

コード例の `Max[T cmp.Ordered]` 関数は、`cmp.Ordered` 制約により
`T` が順序付け可能な型であることを保証し、関数内で `>` 演算子を
安全に使用できるようにしています。
`int`, `float64`, `string` で呼び出せますが、スライスや構造体では
コンパイルエラーになります。

これらの定義済み制約を使うことで、一般的な操作を必要とする
ジェネリックコードを簡単に記述できます。