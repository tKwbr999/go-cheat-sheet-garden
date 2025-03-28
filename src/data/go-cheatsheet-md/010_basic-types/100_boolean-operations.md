---
title: "基本の型: 真偽値の演算 (論理演算)"
tags: ["basic-types", "真偽値", "bool", "論理演算", "AND", "OR", "NOT", "&&", "||", "!"]
---

`bool` 型の値 (`true` または `false`) に対しては、**論理演算子**を使って演算を行うことができます。これにより、複数の条件を組み合わせたり、条件を反転させたりすることができます。

Go言語の主な論理演算子は以下の3つです。

1.  **`&&` (論理 AND):** 両方の値が `true` の場合にのみ `true` を返します。それ以外は `false` を返します。「かつ」を表します。
2.  **`||` (論理 OR):** どちらか一方の値、または両方が `true` の場合に `true` を返します。両方とも `false` の場合にのみ `false` を返します。「または」を表します。
3.  **`!` (論理 NOT):** 値を反転させます。`true` なら `false` に、`false` なら `true` にします。「〜でない」を表します。

## 論理演算子の使い方と真理値表

| a     | b     | a && b (AND) | a \|\| b (OR) | !a (NOT) |
| :---- | :---- | :----------- | :---------- | :------- |
| true  | true  | true         | true        | false    |
| true  | false | false        | true        | false    |
| false | true  | false        | true        | true     |
| false | false | false        | false       | true     |

```go title="論理演算子の使用例"
package main

import "fmt"

func main() {
	a := true
	b := false

	// && (AND)
	fmt.Printf("%t && %t = %t\n", a, a, a && a) // true && true = true
	fmt.Printf("%t && %t = %t\n", a, b, a && b) // true && false = false
	fmt.Printf("%t && %t = %t\n", b, b, b && b) // false && false = false

	fmt.Println() // 空行

	// || (OR)
	fmt.Printf("%t || %t = %t\n", a, a, a || a) // true || true = true
	fmt.Printf("%t || %t = %t\n", a, b, a || b) // true || false = true
	fmt.Printf("%t || %t = %t\n", b, b, b || b) // false || false = false

	fmt.Println() // 空行

	// ! (NOT)
	fmt.Printf("!%t = %t\n", a, !a) // !true = false
	fmt.Printf("!%t = %t\n", b, !b) // !false = true

	fmt.Println() // 空行

	// 組み合わせ
	result1 := (a || b) && a // (true || false) && true -> true && true -> true
	result2 := !(a && b)   // !(true && false) -> !false -> true
	fmt.Printf("(%t || %t) && %t = %t\n", a, b, a, result1)
	fmt.Printf("!(%t && %t) = %t\n", a, b, result2)
}

/* 実行結果:
true && true = true
true && false = false
false && false = false

true || true = true
true || false = true
false || false = false

!true = false
!false = true

(true || false) && true = true
!(true && false) = true
*/
```

## 短絡評価 (Short-circuit Evaluation)

Goの論理演算子 `&&` と `||` は**短絡評価**を行います。これは、演算の結果が左側の値だけで確定する場合、右側の値は評価（実行）されないという性質です。

*   **`&&` (AND):** 左側が `false` なら、結果は必ず `false` になるため、右側は評価されません。
*   **`||` (OR):** 左側が `true` なら、結果は必ず `true` になるため、右側は評価されません。

これは、関数の呼び出しなどを右側に置く場合に重要になります。

```go title="短絡評価の例"
package main

import "fmt"

// この関数が呼ばれたらメッセージを表示する
func checkRightSide() bool {
	fmt.Println("右側が評価されました！")
	return true
}

func main() {
	fmt.Println("--- && の短絡評価 ---")
	// 左側が false なので、右側の checkRightSide() は呼ばれない
	result1 := false && checkRightSide()
	fmt.Printf("結果1: %t\n", result1)

	fmt.Println("\n--- || の短絡評価 ---")
	// 左側が true なので、右側の checkRightSide() は呼ばれない
	result2 := true || checkRightSide()
	fmt.Printf("結果2: %t\n", result2)

	fmt.Println("\n--- 短絡評価されない場合 ---")
	// 左側が true なので、&& の結果は右側次第。右側が評価される。
	result3 := true && checkRightSide()
	fmt.Printf("結果3: %t\n", result3)
}

/* 実行結果:
--- && の短絡評価 ---
結果1: false
--- || の短絡評価 ---
結果2: true
--- 短絡評価されない場合 ---
右側が評価されました！
結果3: true
*/
```

短絡評価は、不要な計算や副作用（関数呼び出しなど）を避けるために役立ちます。例えば、ポインタが `nil` でないことを確認してからそのポインタのメソッドを呼び出す、といった場合に安全にコードを書くことができます。

```go
// p が nil でない かつ p の IsValid() メソッドが true を返すか
// もし p が nil なら、p.IsValid() は評価されないので安全
if p != nil && p.IsValid() {
    // ... 処理 ...
}
```

論理演算子は、プログラムの条件分岐や制御フローを組み立てる上で基本的なツールです。