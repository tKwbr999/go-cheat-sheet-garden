## タイトル
title: 関数型 (Function Type) の宣言

## タグ
tags: ["functions", "func", "型", "関数型", "type"]

## コード
```go
package main

import "fmt"

// 関数型の宣言: int引数2つ、戻り値int の関数型に Operator という名前を付ける
type Operator func(int, int) int

// Operator 型の関数を引数として受け取る関数
func calculate(a, b int, op Operator) int {
	fmt.Printf("実行: %T\n", op)
	return op(a, b)
}

// Operator 型のシグネチャに合致する具体的な関数
func add(a, b int) int {
	return a + b
}

func main() {
	// 関数型の変数に関数を代入
	var opAdd Operator = add

	// 関数型を引数として渡す
	result1 := calculate(10, 5, opAdd) // 変数を渡す
	result2 := calculate(10, 5, add)   // 関数を直接渡す

	fmt.Printf("10 + 5 = %d\n", result1)
	fmt.Printf("10 + 5 = %d\n", result2)
}

```

## 解説
```text
Goでは関数は「第一級オブジェクト」であり、**型**を持ちます。
関数の型はその**シグネチャ**（引数と戻り値の型と順序）で決まります。
例: `func(int, string) bool`

**`type` による関数型の宣言:**
`type` キーワードで、特定の関数シグネチャを持つ関数型に
**独自の別名**を付けることができます。

**構文:**
`type 新しい型名 func(引数リスト) 戻り値リスト`

コード例では `type Operator func(int, int) int` で
`func(int, int) int` という関数型に `Operator` という
名前を付けています。

**関数型の利用:**
*   **変数宣言:** `var opAdd Operator = add` のように、
    シグネチャが一致する関数を関数型の変数に代入できます。
*   **関数の引数/戻り値:** `calculate` 関数の引数 `op` のように、
    関数の引数や戻り値の型として使えます。
    呼び出す際は、関数型の変数 (`opAdd`) や、
    シグネチャが一致する関数 (`add`) を直接渡せます。

**利点:**
*   **可読性:** `func(...) ...` と書く代わりに `Operator` のような
    意味のある名前で型を表現できます。
*   **意図明確化:** 型名で関数の役割を示すことができます。
*   **再利用性:** 同じシグネチャを持つ関数を扱うコードを
    共通化しやすくなります。

関数型は、Goで関数を値として扱う際にコードを整理し、
表現力を高めるための重要な機能です。