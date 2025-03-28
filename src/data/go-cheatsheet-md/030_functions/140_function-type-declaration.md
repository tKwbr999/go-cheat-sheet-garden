---
title: "関数: 関数型 (Function Type) の宣言"
tags: ["functions", "func", "型", "関数型", "type"]
---

Go言語では、関数は「第一級オブジェクト」であり、他の値（整数、文字列、構造体など）と同じように**型**を持ちます。関数の型は、その**シグネチャ**、つまり**引数の型と順序**、そして**戻り値の型と順序**によって決まります。

例えば、`func(int, int) int` は、「2つの `int` 型引数を受け取り、1つの `int` 型の値を返す関数」の型を表します。

## `type` キーワードによる関数型の宣言

`type` キーワードを使うと、特定の関数シグネチャを持つ関数型に**独自の別名**を付けることができます。これにより、同じシグネチャを持つ関数をより簡潔に、そして意味のある名前で扱えるようになります。

**構文:**
```go
type 新しい型名 func(引数リスト) 戻り値リスト
```

## コード例

```go title="関数型の宣言と利用"
package main

import (
	"fmt"
	"strings"
)

// --- 関数型の宣言 ---

// int 型の引数を2つ受け取り、int 型の値を1つ返す関数型に `Operator` という名前を付ける
type Operator func(int, int) int

// string 型の引数を1つ受け取り、string 型の値を1つ返す関数型に `StringTransformer` という名前を付ける
type StringTransformer func(string) string

// string 型の引数を1つ受け取り、error 型の値を1つ返す関数型に `Validator` という名前を付ける
type Validator func(string) error

// --- 関数型を利用する関数 ---

// Operator 型の関数を受け取り、実行する関数
func calculate(a, b int, op Operator) int {
	fmt.Printf("計算を実行: %T\n", op) // op の型は main.Operator
	return op(a, b)
}

// StringTransformer 型の関数を受け取り、実行する関数
func transform(s string, transformer StringTransformer) string {
	return transformer(s)
}

// --- 関数型に合致する具体的な関数 ---

func add(a, b int) int {
	return a + b
}

func subtract(a, b int) int {
	return a - b
}

func toUpper(s string) string {
	return strings.ToUpper(s)
}

func main() {
	// --- 関数型を使った変数の宣言と代入 ---
	var opAdd Operator = add       // add 関数は Operator 型のシグネチャに合致するので代入可能
	opSubtract := subtract         // 型推論でも Operator 型になるわけではない (基底型は func(int, int) int)
	var transformerUpper StringTransformer = toUpper

	// --- 関数型を引数として渡す ---
	result1 := calculate(10, 5, opAdd)      // Operator 型の変数 opAdd を渡す
	result2 := calculate(10, 5, subtract)   // Operator 型のシグネチャに合致する subtract 関数を直接渡す
	// result3 := calculate(10, 5, multiply) // エラー: multiply は Operator 型ではない (戻り値が違うなど)

	fmt.Printf("10 + 5 = %d\n", result1)
	fmt.Printf("10 - 5 = %d\n", result2)

	transformed1 := transform("hello", transformerUpper) // StringTransformer 型の変数を渡す
	transformed2 := transform("world", strings.ToLower) // StringTransformer 型のシグネチャに合致する関数を直接渡す

	fmt.Printf("大文字化: %s\n", transformed1)
	fmt.Printf("小文字化: %s\n", transformed2)

	// 関数型のゼロ値は nil
	var nilOp Operator
	if nilOp == nil {
		fmt.Println("\nnilOp は nil です")
	}
	// nilOp(1, 2) // panic: runtime error: invalid memory address or nil pointer dereference
}

/* 実行結果:
計算を実行: main.Operator
計算を実行: main.Operator
10 + 5 = 15
10 - 5 = 5
大文字化: HELLO
小文字化: world

nilOp は nil です
*/
```

**コード解説:**

*   `type Operator func(int, int) int`: `func(int, int) int` というシグネチャを持つ関数型に `Operator` という名前を付けています。
*   `type StringTransformer func(string) string`: 同様に `func(string) string` 型に `StringTransformer` という名前を付けています。
*   `calculate` 関数は、第3引数として `Operator` 型の関数 `op` を受け取ります。
*   `transform` 関数は、第2引数として `StringTransformer` 型の関数 `transformer` を受け取ります。
*   `main` 関数内では、`add` 関数（`Operator` 型とシグネチャが一致）を `Operator` 型の変数 `opAdd` に代入しています。
*   `calculate` 関数を呼び出す際に、`Operator` 型の変数 `opAdd` や、シグネチャが一致する `subtract` 関数を直接渡すことができます。
*   同様に、`transform` 関数にも `StringTransformer` 型の変数や、シグネチャが一致する `strings.ToLower` 関数を渡すことができます。
*   関数型の変数も、初期化されなければゼロ値である `nil` になります。`nil` の関数変数を呼び出そうとするとパニックが発生します。

## 関数型を使う利点

*   **可読性の向上:** `func(int, int) int` と書く代わりに `Operator` と書けるため、コードが読みやすくなります。特に関数を引数や戻り値として多用する場合に有効です。
*   **意図の明確化:** 型名によって、その関数がどのような役割を果たすべきか（例: `Operator`, `Validator`, `Handler`）を示すことができます。
*   **再利用性の向上:** 同じシグネチャを持つ関数を扱うコードを共通化しやすくなります。

関数型は、Goで関数を値として扱う際に、コードをより整理し、表現力を高めるための重要な機能です。