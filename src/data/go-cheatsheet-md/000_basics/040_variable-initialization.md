## タイトル
title: 変数の初期化: 宣言と同時に値を設定

## タグ
tags: ["basics", "変数", "初期化", "型推論"]

## コード
```go
package main

import "fmt"

func main() {
	// var で宣言時に初期値を指定すると、型を省略できる (型推論)
	var greeting = "おはよう" // string と推論
	var number = 100      // int と推論
	var ratio = 0.5       // float64 と推論

	fmt.Printf("greeting: %s (%T)\n", greeting, greeting)
	fmt.Printf("number: %d (%T)\n", number, number)
	fmt.Printf("ratio: %f (%T)\n", ratio, ratio)

	// 型を明示することも可能
	var explicitType int = 200
	fmt.Printf("explicitType: %d (%T)\n", explicitType, explicitType)
}

```

## 解説
```text
変数を宣言する際、同時に最初の値（**初期値**）を設定することを**初期化**と呼びます。初期化により、変数が意図しないゼロ値を持つことを防ぎ、コードの意図が明確になります。

**初期化と型推論:**
`var` で変数を宣言する際に初期値を指定すると、多くの場合、型指定を省略できます。Goコンパイラが初期値から型を推論するためです。
`var 変数名 = 初期値`
*   コンパイラが `初期値` の型を判断し、自動的に `変数名` の型を決定します。
*   これは短縮変数宣言 `:=` と同じ型推論の仕組みです。
*   ただし、`var` は関数外（パッケージレベル）でも使用できます。

コード例では `greeting`, `number`, `ratio` が型推論によって型が決まっています。`explicitType` は型を明示的に指定しています。

**関数の戻り値を使った初期化:**
変数の初期値には、他の関数呼び出しの結果（戻り値）も使用できます。
```go
import "os"
// ...
var homeDir = os.Getenv("HOME") // os.Getenv の戻り値(string)で初期化
```

型推論を活用することで、コードを簡潔に保つことができます。