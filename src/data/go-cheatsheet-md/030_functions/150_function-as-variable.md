---
title: "関数: 関数を変数に代入する"
tags: ["functions", "func", "関数型", "変数", "第一級オブジェクト", "関数リテラル"]
---

Go言語では、関数は**第一級オブジェクト (First-Class Citizen)** として扱われます。これは、関数が他の値（整数、文字列、構造体など）と同じように、以下のような操作が可能であることを意味します。

*   **変数に代入できる**
*   関数の引数として渡せる
*   関数の戻り値として返せる

ここでは、**関数を変数に代入する**方法を見ていきます。

## 関数型の変数

関数を代入するためには、その関数の型（シグネチャ）に合った**関数型の変数**を宣言する必要があります。

**構文:**
```go
var 変数名 func(引数リスト) 戻り値リスト
```

または、`type` で定義した関数型名を使うこともできます。

```go
type MyFuncType func(引数リスト) 戻り値リスト
var 変数名 MyFuncType
```

## 関数や関数リテラルの代入

宣言した関数型の変数には、シグネチャが一致する**通常の関数名**や、その場で定義する**関数リテラル（無名関数）** を代入することができます。

代入後は、その**変数名を使って関数を呼び出す**ことができます。

```go title="関数を変数に代入して呼び出す例"
package main

import "fmt"

// 通常の関数定義
func add(a, b int) int {
	return a + b
}

func multiply(a, b int) int {
	return a * b
}

// 関数型を定義 (オプションだが可読性向上)
type BinaryIntOperator func(int, int) int

func main() {
	// --- 関数型の変数を宣言し、関数名を代入 ---
	var operation BinaryIntOperator // BinaryIntOperator 型の変数 operation を宣言 (ゼロ値は nil)
	fmt.Printf("初期状態の operation: %v (%T)\n", operation, operation)

	operation = add // add 関数のシグネチャは BinaryIntOperator と一致するので代入可能
	fmt.Printf("add を代入後の operation: %v (%T)\n", operation, operation)

	// 変数 operation を使って add 関数を呼び出す
	result1 := operation(10, 5)
	fmt.Printf("operation(10, 5) = %d\n", result1) // 15

	operation = multiply // multiply 関数もシグネチャが一致するので代入可能
	result2 := operation(10, 5)
	fmt.Printf("operation(10, 5) = %d\n", result2) // 50

	// --- 関数リテラル (無名関数) を変数に代入 ---
	// 変数 greet に string を受け取り string を返す関数リテラルを代入
	greet := func(name string) string {
		return "Hello, " + name + "!"
	}
	// greet 変数を使って関数リテラルを呼び出す
	message := greet("Gopher")
	fmt.Println(message) // Hello, Gopher!

	// 型を明示的に宣言して代入も可能
	var sayGoodbye func(string) = func(name string) {
		fmt.Println("Goodbye,", name)
	}
	sayGoodbye("Alice") // Goodbye, Alice

	// --- nil チェック ---
	var nilFunc func()
	if nilFunc == nil {
		fmt.Println("nilFunc は nil です")
	}
	// nilFunc() // panic: runtime error: invalid memory address or nil pointer dereference
}

/* 実行結果:
初期状態の operation: <nil> (main.BinaryIntOperator)
add を代入後の operation: 0x10a0a90 (main.BinaryIntOperator)
operation(10, 5) = 15
operation(10, 5) = 50
Hello, Gopher!
Goodbye, Alice
nilFunc は nil です
*/
```

**コード解説:**

*   `type BinaryIntOperator func(int, int) int`: 関数型に別名を付けています。
*   `var operation BinaryIntOperator`: `BinaryIntOperator` 型の変数 `operation` を宣言します。初期値は `nil` です。
*   `operation = add`: シグネチャが一致する `add` 関数を `operation` に代入します。`operation` は `add` 関数そのものを指すようになります。
*   `result1 := operation(10, 5)`: 変数 `operation` を使って、現在代入されている関数（この時点では `add`）を呼び出します。
*   `operation = multiply`: `operation` に `multiply` 関数を再代入します。
*   `result2 := operation(10, 5)`: 再び `operation` を呼び出すと、今度は `multiply` 関数が実行されます。
*   `greet := func(name string) string { ... }`: 関数リテラルを定義し、それを直接変数 `greet` に代入しています。`greet` の型は `func(string) string` と推論されます。
*   `message := greet("Gopher")`: 変数 `greet` を使って関数リテラルを呼び出します。

## 利点

関数を変数に代入できることで、以下のようなことが可能になります。

*   **処理の切り替え:** 変数に代入する関数を状況に応じて変えることで、実行する処理を動的に切り替える。
*   **関数のコレクション:** 関数をスライスやマップに格納して管理する。
*   **高階関数:** 関数を引数として受け取ったり、戻り値として返したりする（次のセクションで説明）。

関数を値として扱えることは、Goの柔軟性と表現力を高める重要な要素です。