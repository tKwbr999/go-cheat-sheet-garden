## タイトル
title: 空インターフェースと型スイッチ

## タグ
tags: ["interfaces", "interface", "any", "空インターフェース", "型スイッチ", "type switch", "switch"]

## コード
```go
package main

import "fmt"

// any 型の値を受け取り、型に応じて処理
func processAnything(value any) {
	fmt.Printf("入力: %v, ", value)
	switch v := value.(type) { // 型スイッチ
	case int:
		fmt.Printf("整数: %d\n", v)
	case string:
		fmt.Printf("文字列: %s\n", v)
	case bool:
		fmt.Printf("真偽値: %t\n", v)
	case nil:
		fmt.Println("nil")
	default:
		fmt.Printf("その他 (%T)\n", v)
	}
}

func main() {
	processAnything(100)
	processAnything("Go")
	processAnything(true)
	processAnything(nil)
	processAnything(1.23) // default
}

```

## 解説
```text
空インターフェース (`any`/`interface{}`) は
任意の型の値を保持できるため、その具体的な型に
応じて処理を分岐させたい場合に
**型スイッチ (Type Switch)** が役立ちます。
(`switch` 文の特殊形式)

型スイッチを使うと、複数の型アサーションを
`if-else if` で繋げるよりも安全かつ簡潔に書けます。

**構文:**
```go
switch 変数 := インターフェース変数.(type) {
case 型1:
    // 変数 は 型1 として使える
case 型2:
    // 変数 は 型2 として使える
case nil:
    // nil の場合
default:
    // どの型にも一致しない場合
}
```
*   `.(type)` キーワードで型スイッチを開始。
*   各 `case` で型を指定し、一致すればそのブロックを実行。
    ブロック内では `変数` はその `case` の型として扱える。
*   `default` でどの型にも一致しない場合を処理。

コード例の `processAnything` 関数は、`any` 型の `value` を
型スイッチで判別し、型に応じたメッセージを出力します。

空インターフェースを扱う際は、型スイッチが
型に応じた処理を安全に行うための基本的な方法となります。