## タイトル
title: 空インターフェース (`interface{}` / `any`)

## タグ
tags: ["interfaces", "interface", "any", "空インターフェース", "型アサーション", "型スイッチ"]

## コード
```go
package main

import "fmt"

func main() {
	// any 型 (interface{} と同じ) の変数
	var value any

	// 様々な型の値を代入可能
	value = 42
	fmt.Printf("値: %v (%T)\n", value, value)

	value = "Hello"
	fmt.Printf("値: %v (%T)\n", value, value)

	value = 3.14
	fmt.Printf("値: %v (%T)\n", value, value)

	value = true
	fmt.Printf("値: %v (%T)\n", value, value)

	value = []int{1, 2}
	fmt.Printf("値: %v (%T)\n", value, value)

	value = nil
	fmt.Printf("値: %v (%T)\n", value, value)
}

```

## 解説
```text
メソッドを一つも持たないインターフェースを
**空インターフェース (Empty Interface)** と呼びます。
`interface{}` と記述します。

Go 1.18 からはエイリアス **`any`** が導入されました。
`any` は `interface{}` と全く同じ意味で、より簡潔です。
(新しいコードでは `any` の使用を推奨)

**特徴: 任意の型を保持可能**
空インターフェースはメソッドを要求しないため、
Goの**すべての型**が暗黙的に実装しています。
そのため、`any` 型の変数は**任意の型**の値を保持できます。

コード例のように、`int`, `string`, `float64`, `bool`,
スライス、`nil` など、様々な型の値を代入できます。

**使い道:**
型が事前に決まっていない、または様々な型を扱いたい場合に利用されます。
*   `fmt.Println(a ...any)`: 任意の型の引数を取れる。
*   JSON/YAML デコード: 不明な構造のデータを `map[string]any` 等で受ける。
*   コンテナ型: 様々な型の値を格納するリスト等 (ジェネリクスの方が型安全)。

**注意点: 型安全性の低下**
任意の値を保持できる反面、**コンパイル時の型チェックが効きません**。
`any` 型変数に格納された値の具体的な操作 (フィールドアクセス等) は
直接行えません。

値を利用するには、**型アサーション** (`v, ok := value.(int)`) や
**型スイッチ** (`switch v := value.(type)`) を使い、
実行時に型を確認して具体的な型に取り出す必要があります。

**推奨:**
空インターフェースは強力ですが、型安全性が失われるため
**乱用は避けるべき**です。可能な限り、具体的な型や
メソッドを持つインターフェース、あるいは**ジェネリクス**を
使う方が安全で保守しやすいコードになります。