---
title: "インターフェース: 空インターフェース (`interface{}` / `any`)"
tags: ["interfaces", "interface", "any", "空インターフェース", "型アサーション", "型スイッチ"]
---

メソッドを一つも持たないインターフェースを**空インターフェース (Empty Interface)** と呼びます。空インターフェースは `interface{}` と記述します。

Go 1.18 からは、`interface{}` のための**エイリアス (別名)** として **`any`** というキーワードが導入されました。`any` は `interface{}` と全く同じ意味ですが、より簡潔に記述できます。今後、新しいコードでは `any` を使うことが推奨されます。

## 空インターフェースの特徴: 任意の型を保持可能

空インターフェースはメソッドを一つも要求しないため、Goの**すべての型**は（メソッドを持っているかどうかに関わらず）暗黙的に空インターフェースを実装していることになります。

これにより、空インターフェース型 (`interface{}` または `any`) の変数は、**任意の型**の値を保持することができます。

```go title="空インターフェース (any) の使用例"
package main

import "fmt"

func main() {
	// any 型 (interface{} と同じ) の変数を宣言
	var value any

	// 様々な型の値を代入できる
	value = 42
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = "Hello, Go!"
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = 3.14
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = true
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = []int{1, 2, 3}
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = map[string]string{"a": "Apple"}
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = func() { fmt.Println("Function!") }
	fmt.Printf("値: %v (型: %T)\n", value, value)

	value = nil // nil も代入可能
	fmt.Printf("値: %v (型: %T)\n", value, value)
}

/* 実行結果:
値: 42 (型: int)
値: Hello, Go! (型: string)
値: 3.14 (型: float64)
値: true (型: bool)
値: [1 2 3] (型: []int)
値: map[a:Apple] (型: map[string]string)
値: 0x10a0a90 (型: func())
値: <nil> (型: <nil>)
*/
```

## 空インターフェースの使い道

空インターフェースは、関数の引数や戻り値、データ構造の要素などで、**型が事前に決まっていない、あるいは様々な型を扱えるようにしたい**場合に利用されます。

*   **`fmt.Println(a ...any)`:** 様々な型の値を引数として受け取って表示できます。
*   **JSON や YAML のデコード:** 構造が不明なデータをとりあえず `map[string]any` や `[]any` として受け取る場合。
*   **コンテナ型:** 様々な型の値を格納できるリストやキューなどを実装する場合（ただし、ジェネリクスの方が型安全な場合が多い）。

## 空インターフェースの注意点: 型安全性の低下

空インターフェースは任意の値を保持できるため非常に柔軟ですが、その代償として**コンパイル時の型チェックが効かなくなります**。空インターフェース型の変数に格納された値に対して、元の具体的な型の操作（フィールドアクセスやメソッド呼び出しなど）を直接行うことはできません。

空インターフェース変数に格納された値を利用するには、**型アサーション (Type Assertion)** や**型スイッチ (Type Switch)** を使って、実行時に値の型を確認し、具体的な型に取り出す必要があります。

```go title="空インターフェースと型アサーション/型スイッチ"
package main

import "fmt"

func processValue(value any) {
	fmt.Printf("処理対象: %v\n", value)

	// 型スイッチを使って型を判別
	switch v := value.(type) {
	case int:
		fmt.Printf("  これは整数です。2倍すると %d\n", v*2)
	case string:
		fmt.Printf("  これは文字列です。長さは %d\n", len(v))
	case bool:
		if v {
			fmt.Println("  これは true です。")
		} else {
			fmt.Println("  これは false です。")
		}
	default:
		fmt.Printf("  これは %T 型です。\n", v)
	}
}

func main() {
	processValue(10)
	processValue("Go")
	processValue(false)
	processValue(1.23) // default ケース
}

/* 実行結果:
処理対象: 10
  これは整数です。2倍すると 20
処理対象: Go
  これは文字列です。長さは 2
処理対象: false
  これは false です。
処理対象: 1.23
  これは float64 型です。
*/
```

**推奨:**

空インターフェースは強力ですが、型安全性が失われるため、**乱用は避けるべき**です。可能な限り、具体的な型や、メソッドを持つ通常のインターフェースを使う方が、コンパイル時のチェックが効き、より安全で保守しやすいコードになります。Go 1.18 で導入された**ジェネリクス (Generics)** も、以前は空インターフェースが使われていた場面（コンテナ型など）で、より型安全な代替手段を提供します。

空インターフェースは、どうしても型が実行時まで分からない場合や、外部ライブラリとの連携などで必要になる場合に限定して使うようにしましょう。