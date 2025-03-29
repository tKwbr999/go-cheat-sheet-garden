## タイトル
title: インターフェース: 空インターフェースと型アサーション

## タグ
tags: ["interfaces", "interface", "any", "空インターフェース", "型アサーション", "type assertion", "カンマOK"]

## コード
```go
package main

import "fmt"

func main() {
	var data any // 空インターフェース

	data = "Hello"

	// カンマOKイディオムで string 型かチェック
	strValue, ok := data.(string)
	if ok {
		fmt.Printf("string として取得成功: \"%s\"\n", strValue)
	} else {
		fmt.Println("string ではない")
	}

	// カンマOKイディオムで int 型かチェック
	intValue, ok := data.(int)
	if ok {
		fmt.Printf("int として取得成功: %d\n", intValue)
	} else {
		// data は string なので失敗 (ok=false, intValue=0)
		fmt.Printf("int ではない (ok=%t, zeroValue=%d)\n", ok, intValue)
	}

	// パニックする可能性のある形式 (非推奨)
	// s := data.(string) // もし data が string でなければ panic
}

```

## 解説
```text
空インターフェース (`any` / `interface{}`) は
任意の型の値を保持できますが、その値を利用するには
通常、**型アサーション**で元の具体的な型に戻す必要があります。

型アサーションの基本は別記 (`040_type-assertion.md`) 参照。

空インターフェース変数 `data` に対して型アサーションを使う場合、
予期しない型が入っている可能性があるため、
**カンマOKイディオム**を使うことが特に重要です。

**構文:** `value, ok := data.(ExpectedType)`

*   `ok` (`bool`) にアサーションが成功したか (`true`) /
    失敗したか (`false`) が入ります。
*   失敗しても**パニックしません**。
*   成功した場合のみ `value` に具体的な型の値が入ります
    (失敗時は `value` はゼロ値)。

コード例では、`any` 型の変数 `data` に文字列 "Hello" を
代入した後、`string` 型と `int` 型へのアサーションを
カンマOKイディオムで試みています。
`string` へのアサーションは成功 (`ok=true`) し、
`int` へのアサーションは失敗 (`ok=false`) します。

1値のみ受け取る形式 (`value := data.(ExpectedType)`) は、
型が異なる場合に `panic` するため、空インターフェースに
対して使うのは危険です。

空インターフェースから値を取り出す際は、
常にカンマOKイディオムで安全に型を確認しましょう。