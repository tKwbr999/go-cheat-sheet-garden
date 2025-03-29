## タイトル
title: 真偽値の演算 (論理演算)

## タグ
tags: ["basic-types", "真偽値", "bool", "論理演算", "AND", "OR", "NOT", "&&", "||", "!"]

## コード
```go
package main

import "fmt"

func main() {
	a := true
	b := false

	// && (AND)
	fmt.Printf("%t && %t = %t\n", a, b, a && b) // false

	// || (OR)
	fmt.Printf("%t || %t = %t\n", a, b, a || b) // true

	// ! (NOT)
	fmt.Printf("!%t = %t\n", a, !a) // false
	fmt.Printf("!%t = %t\n", b, !b) // true

	// 組み合わせ
	result1 := (a || b) && a // true
	result2 := !(a && b)   // true
	fmt.Printf("(%t || %t) && %t = %t\n", a, b, a, result1)
	fmt.Printf("!(%t && %t) = %t\n", a, b, result2)
}
```

## 解説
```text
`bool` 型の値 (`true`/`false`) には
**論理演算子**を使って演算できます。
複数の条件を組み合わせたり、反転させたりします。

**主な論理演算子:**
*   **`&&` (論理 AND):** 両方が `true` なら `true`。「かつ」。
*   **`||` (論理 OR):** どちらかが `true` なら `true`。「または」。
*   **`!` (論理 NOT):** `true` を `false` に、`false` を `true` に反転。「〜でない」。

**真理値表:**
| a     | b     | a && b | a \|\| b | !a    |
| :---- | :---- | :----- | :----- | :---- |
| true  | true  | true   | true   | false |
| true  | false | false  | true   | false |
| false | true  | false  | true   | true  |
| false | false | false  | false  | true  |

**短絡評価 (Short-circuit Evaluation):**
`&&` と `||` は短絡評価を行います。
結果が左側の値だけで確定する場合、
右側の値は評価（実行）されません。
*   `&&`: 左側が `false` なら右側は評価されない。
*   `||`: 左側が `true` なら右側は評価されない。

これは不要な計算や副作用（関数呼び出しなど）を
避けるのに役立ちます。例えば、ポインタが `nil` で
ないことを確認してからメソッドを呼び出す場合に
安全に書けます (`if p != nil && p.IsValid() { ... }`)。
もし `p` が `nil` なら `p.IsValid()` は評価されません。