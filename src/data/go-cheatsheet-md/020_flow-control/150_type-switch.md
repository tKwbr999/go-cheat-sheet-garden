## タイトル
title: 制御構文: 型スイッチ (Type Switch)

## タグ
tags: ["flow-control", "switch", "case", "type", "インターフェース", "interface", "any", "型アサーション"]

## コード
```go
package main

import "fmt"

func printTypeAndValue(value any) { // any は interface{} のエイリアス
	fmt.Printf("入力: %v, ", value)

	switch v := value.(type) { // 型スイッチ
	case nil:
		fmt.Println("型: nil")
	case int:
		fmt.Printf("型: int, 値*2: %d\n", v*2) // v は int
	case string:
		fmt.Printf("型: string, 値: %s\n", v) // v は string
	case bool:
		fmt.Printf("型: bool, 値: %t\n", v) // v は bool
	default:
		fmt.Printf("型: 不明 (%T)\n", v) // v は元の型 (any)
	}
}

func main() {
	printTypeAndValue(123)
	printTypeAndValue("Hello")
	printTypeAndValue(true)
	printTypeAndValue(nil)
	printTypeAndValue(1.23) // default にマッチ
}

```

## 解説
```text
Goのインターフェース型、特に空インターフェース `any`
(`interface{}`) は、任意の型の値を保持できます。
インターフェース変数に格納された値の**実際の型**に
基づいて処理を分岐させたい場合に**型スイッチ**を使います。
これは `switch` 文の特殊な形式です。

**構文:**
```go
switch 変数 := インターフェース変数.(type) {
case 型1:
    // 変数 は 型1 として使える
case 型2:
    // 変数 は 型2 として使える
case nil:
    // インターフェース変数が nil の場合
default:
    // どの型にも一致しない場合
    // 変数 は元のインターフェース型
}
```
*   `インターフェース変数.(type)`: 型スイッチを
    行うための特別な構文 (`switch` の初期化でのみ使用可)。
*   `変数`: 各 `case` ブロック内で、判別された
    具体的な型の値を受け取る。
*   `case 型1:`: 値の型が `型1` かチェック。一致すれば
    このブロックが実行され、`変数` は `型1` として扱える。
*   `case nil:`: `nil` かチェック。
*   `default:`: どの型にも一致しない場合。

コード例では `printTypeAndValue` 関数が `any` 型の引数を取り、
型スイッチで実際の型 (`int`, `string`, `bool`, `nil`) を
判別して異なる処理を行っています。
どの `case` にも一致しない型 (例: `float64`) は
`default` で処理されます。

型スイッチは、インターフェースに格納された未知の型の値を
安全に扱い、型に応じた処理を行うための強力な機能です。