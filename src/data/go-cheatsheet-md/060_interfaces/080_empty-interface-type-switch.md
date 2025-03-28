---
title: "インターフェース: 空インターフェースと型スイッチ"
tags: ["interfaces", "interface", "any", "空インターフェース", "型スイッチ", "type switch", "switch"]
---

空インターフェース (`interface{}` または `any`) は任意の型の値を保持できるため、その変数に実際にどのような型の値が入っているかによって処理を分岐させたい場合がよくあります。このような場合に**型スイッチ (Type Switch)** が非常に役立ちます。

型スイッチの基本的な構文と動作については、**「制御構文」**セクションの**「型スイッチ (Type Switch)」**の項目 (`020_flow-control/150_type-switch.md`) を参照してください。

型スイッチを使うことで、複数の型アサーションを `if-else if` で繋げるよりも、コードを安全かつ簡潔に記述できます。

```go title="空インターフェースに対する型スイッチ"
package main

import "fmt"

// 任意の型の値を受け取り、型に応じて処理する関数
func processAnything(value any) {
	fmt.Printf("入力値: %v\n", value)

	switch v := value.(type) { // value の具体的な型をチェック
	case int:
		fmt.Printf("  -> 整数です。値: %d\n", v)
	case string:
		fmt.Printf("  -> 文字列です。値: \"%s\"\n", v)
	case bool:
		fmt.Printf("  -> 真偽値です。値: %t\n", v)
	case float64:
		fmt.Printf("  -> 浮動小数点数です。値: %f\n", v)
	case nil:
		fmt.Println("  -> nil です。")
	default:
		// v は元の any 型
		fmt.Printf("  -> その他の型です。型: %T\n", v)
	}
}

func main() {
	processAnything(100)
	processAnything("Hello")
	processAnything(true)
	processAnything(nil)
	processAnything([]byte("data")) // default ケース
}

/* 実行結果:
入力値: 100
  -> 整数です。値: 100
入力値: Hello
  -> 文字列です。値: "Hello"
入力値: true
  -> 真偽値です。値: true
入力値: <nil>
  -> nil です。
入力値: [100 97 116 97]
  -> その他の型です。型: []uint8
*/
```

**ポイント:**

*   `switch v := value.(type)`: 空インターフェース変数 `value` に対して型スイッチを行います。
*   `case 型:`: `value` が指定した `型` であった場合に、そのブロックが実行されます。ブロック内では、変数 `v` はその `型` として扱えます。
*   `default:`: どの `case` にも一致しなかった場合に実行されます。

空インターフェースを扱う際には、型スイッチが型に応じた処理を安全に行うための基本的な方法となります。