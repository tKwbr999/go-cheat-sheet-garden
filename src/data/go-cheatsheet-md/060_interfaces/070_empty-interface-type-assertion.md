---
title: "インターフェース: 空インターフェースと型アサーション"
tags: ["interfaces", "interface", "any", "空インターフェース", "型アサーション", "type assertion", "カンマOK"]
---

空インターフェース (`interface{}` または `any`) は任意の型の値を保持できますが、その値を利用するには通常、**型アサーション (Type Assertion)** を使って元の具体的な型に戻す必要があります。

型アサーションの基本的な構文と注意点（パニックの可能性、カンマOKイディオム）については、**「型アサーション (Type Assertion)」**の項目 (`060_interfaces/040_type-assertion.md`) を参照してください。

ここでは、空インターフェース変数に対して型アサーションを使う簡単な例を示します。

```go title="空インターフェースに対する型アサーション"
package main

import "fmt"

func main() {
	var data any // 空インターフェース型の変数

	data = "これは文字列です"

	// カンマOKイディオムを使って string 型へのアサーションを試みる
	strValue, ok := data.(string)
	if ok {
		fmt.Printf("文字列として取得成功: \"%s\"\n", strValue)
	} else {
		fmt.Println("文字列ではありません。")
	}

	// カンマOKイディオムを使って int 型へのアサーションを試みる
	intValue, ok := data.(int)
	if ok {
		fmt.Printf("整数として取得成功: %d\n", intValue)
	} else {
		// data は string なので、こちらが実行される
		fmt.Printf("整数ではありません。(ok=%t, 取得された値のゼロ値=%d)\n", ok, intValue)
	}

	// パニックする可能性のあるアサーション (非推奨)
	// もし data の型が string でなければ、ここで panic する
	// strValuePanic := data.(string)
	// fmt.Println(strValuePanic)
}

/* 実行結果:
文字列として取得成功: "これは文字列です"
整数ではありません。(ok=false, 取得された値のゼロ値=0)
*/
```

空インターフェースから値を取り出す際は、予期しない型が入っている可能性を考慮し、常にカンマOKイディオム (`value, ok := data.(ExpectedType)`) を使って安全に型アサーションを行うことが重要です。