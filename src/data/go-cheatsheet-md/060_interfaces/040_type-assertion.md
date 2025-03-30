## タイトル
title: 型アサーション (Type Assertion)

## タグ
tags: ["interfaces", "interface", "型アサーション", "type assertion", "カンマOK", "panic"]

## コード
```go
package main

import "fmt"

func main() {
	var i any // interface{} と同じ

	i = "Hello"

	// カンマOKイディオム (安全な方法)
	fmt.Println("--- カンマOKイディオム ---")
	s2, ok1 := i.(string) // string かチェック
	if ok1 {
		fmt.Printf("i は string: \"%s\"\n", s2)
	} else {
		fmt.Println("i は string ではない")
	}

	num2, ok2 := i.(int) // int かチェック
	if ok2 {
		fmt.Printf("i は int: %d\n", num2)
	} else {
		// ok2 は false, num2 は int のゼロ値 0
		fmt.Printf("i は int ではない (ok=%t, value=%d)\n", ok2, num2)
	}

	// if 文の初期化と組み合わせるのが一般的
	fmt.Println("\n--- if 文との組み合わせ ---")
	i = 123 // i に int を代入
	if num, ok := i.(int); ok {
		// アサーション成功時のみ実行
		fmt.Printf("i は int で値は %d\n", num)
	} else {
		fmt.Println("i は int ではない")
	}
}

```

## 解説
```text
インターフェース変数に格納された値の**具体的な型**を知り、
その型のフィールドやメソッドにアクセスしたい場合に
**型アサーション (Type Assertion)** を使います。
「この変数は実際にはこの型のはずだ」と表明する操作です。

**構文:** `インターフェース変数.(具体的な型)`

**形式:**
1.  **1値受け取り (Panic可能性あり):**
    `value := iface.(Type)`
    *   成功: `value` に具体的な型の値が入る。
    *   失敗 (`nil` or 型違い): **`panic`** する。
    *   型が確実な場合以外は非推奨。

2.  **カンマOKイディオム (安全・推奨):**
    `value, ok := iface.(Type)`
    *   `value`: 成功時は具体的な型の値、失敗時は**型のゼロ値**。
    *   `ok`: 成功時は `true`、失敗時は `false` (`bool`)。
    *   **パニックしない**。`ok` で成功/失敗を判断できる。

コード例では、カンマOKイディオムを使っています。
`s2, ok1 := i.(string)` では `i` が `string` なので `ok1` は `true`。
`num2, ok2 := i.(int)` では `i` が `string` なので `ok2` は `false`。

`nil` インターフェースに対する型アサーションは常に失敗し、
カンマOK形式では `ok` が `false` に、1値形式では `panic` します。

**`if` 文との組み合わせ:**
`if value, ok := iface.(Type); ok { ... }`
のように、`if` の初期化ステートメントで型アサーションを行い、
`ok` が `true` の場合のみブロックを実行するのが一般的です。

型アサーションはインターフェースの値を具体的に扱う際に
不可欠ですが、安全のためカンマOKイディオムを使いましょう。