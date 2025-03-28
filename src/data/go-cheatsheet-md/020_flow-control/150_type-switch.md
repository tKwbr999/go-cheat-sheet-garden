---
title: "制御構文: 型スイッチ (Type Switch)"
tags: ["flow-control", "switch", "case", "type", "インターフェース", "interface", "any", "型アサーション"]
---

Goの**インターフェース (Interface)** 型は、様々な具体的な型の値を保持することができます。特に、**空インターフェース (`interface{}`)** またはそのエイリアスである **`any`** (Go 1.18以降) は、**任意の型**の値を保持できます。

インターフェース変数に格納されている値の**実際の型**に基づいて処理を分岐させたい場合に使うのが、**型スイッチ (Type Switch)** です。これは `switch` 文の特殊な形式です。

## 型スイッチの構文

型スイッチは、`switch` 文の初期化ステートメント部分で特殊な「型アサーション」構文 `変数.(type)` を使います。

**構文:**
```go
switch 変数 := インターフェース変数.(type) {
case 型1:
	// インターフェース変数が 型1 の値を持っていた場合の処理
	// このブロック内では、変数 は 型1 として扱える
case 型2:
	// インターフェース変数が 型2 の値を持っていた場合の処理
	// このブロック内では、変数 は 型2 として扱える
case nil:
	// インターフェース変数が nil だった場合の処理
default:
	// 上記のどの型にも一致しなかった場合の処理
	// このブロック内では、変数 は元のインターフェース変数と同じ型になる
}
```

*   `インターフェース変数`: 型を調べたいインターフェース型の変数。
*   `.(type)`: 型スイッチであることを示す特別なキーワード。これは `switch` 文の初期化ステートメントでのみ使用できます。
*   `変数`: 各 `case` ブロック内で、判別された具体的な型の値を受け取る変数。
*   `case 型1:`: インターフェース変数が保持している値の型が `型1` であるかをチェックします。一致した場合、この `case` ブロックが実行され、`変数` は `型1` の値として利用できます。
*   `case nil:`: インターフェース変数が `nil` であるかをチェックします。
*   `default:`: どの `case` にも一致しなかった場合に実行されます。

## コード例

様々な型の値を `any` (空インターフェース) 型の変数に代入し、型スイッチで判別する例を見てみましょう。

```go title="型スイッチの使用例"
package main

import "fmt"

// 様々な型の値を処理する関数
func printTypeAndValue(value any) { // any は interface{} のエイリアス
	fmt.Printf("入力値: %v, ", value)

	// 型スイッチで value の実際の型を判別
	switch v := value.(type) {
	case nil:
		fmt.Println("型: nil")
	case int:
		// このブロック内では v は int 型として扱える
		fmt.Printf("型: int, 値の2倍: %d\n", v*2)
	case string:
		// このブロック内では v は string 型として扱える
		fmt.Printf("型: string, 大文字: %s\n", toUpper(v)) // toUpper は string を受け取る関数
	case bool:
		// このブロック内では v は bool 型として扱える
		if v {
			fmt.Println("型: bool, 値: true")
		} else {
			fmt.Println("型: bool, 値: false")
		}
	case float64:
		// このブロック内では v は float64 型として扱える
		fmt.Printf("型: float64, 値の半分: %f\n", v/2)
	default:
		// どの case にも一致しなかった場合
		// v は元の value と同じ型 (この例では any)
		fmt.Printf("型: 不明 (%T)\n", v)
	}
}

// string を受け取り大文字にするヘルパー関数 (説明用)
func toUpper(s string) string {
	var result string
	for _, r := range s {
		if r >= 'a' && r <= 'z' {
			result += string(r - ('a' - 'A'))
		} else {
			result += string(r)
		}
	}
	return result
}


func main() {
	printTypeAndValue(123)
	printTypeAndValue("Hello")
	printTypeAndValue(true)
	printTypeAndValue(3.14)
	printTypeAndValue(nil)
	printTypeAndValue([]int{1, 2}) // スライス (default にマッチ)
}

/* 実行結果:
入力値: 123, 型: int, 値の2倍: 246
入力値: Hello, 型: string, 大文字: HELLO
入力値: true, 型: bool, 値: true
入力値: 3.14, 型: float64, 値の半分: 1.570000
入力値: <nil>, 型: nil
入力値: [1 2], 型: 不明 ([]int)
*/
```

**コード解説:**

*   `printTypeAndValue` 関数は、任意の型の値を受け取るために引数の型を `any` (または `interface{}`) にしています。
*   `switch v := value.(type)` で型スイッチを開始します。
*   `case int:`: `value` が `int` 型の場合、このブロックが実行され、`v` は `int` 型の値として使えます (`v*2`)。
*   `case string:`: `value` が `string` 型の場合、このブロックが実行され、`v` は `string` 型の値として使えます (`toUpper(v)`)。
*   他の `case` も同様に、それぞれの型に応じた処理を行います。
*   `case nil:` で `nil` の場合を処理します。
*   `default:` で、上記のどの型にも一致しない場合（例: `[]int` スライス）の処理を行います。`default` ブロック内の `v` は元の `value` と同じ型（この場合は `any`）になります。

型スイッチは、インターフェース変数に格納された未知の型の値を安全に扱い、型に応じた適切な処理を行うための強力な機能です。