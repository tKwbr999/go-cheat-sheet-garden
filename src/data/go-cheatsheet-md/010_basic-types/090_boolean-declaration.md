---
title: "基本の型: 真偽値 (Boolean)"
tags: ["basic-types", "真偽値", "bool", "true", "false"]
---

プログラムでは、「はい/いいえ」「真/偽」「ON/OFF」のような二つの状態のどちらかを表したい場面がよくあります。このような状態を表現するために使われるのが**真偽値 (Boolean)** 型です。

## 真偽値型 (`bool`) とは？

Go言語の真偽値型は `bool` と呼ばれ、**`true`** (真) または **`false`** (偽) のどちらか一方の値しか取ることができません。

`bool` 型は、条件分岐（`if` 文など）やループの制御、フラグ（状態のON/OFF）の管理などに不可欠な型です。

## `bool` 型の宣言

`var` や `:=` を使って `bool` 型の変数を宣言できます。

```go title="bool 型の宣言例"
package main

import "fmt"

func main() {
	// var を使った宣言
	var isGoFun bool = true // 型を明示的に指定
	var isLearning bool    // 初期値を省略した場合、ゼロ値は false になる

	// := を使った宣言 (関数内のみ)
	isEnabled := true  // 型推論により bool になる
	hasError := false // 型推論により bool になる

	fmt.Println("Goは楽しい？:", isGoFun)
	fmt.Println("学習中？:", isLearning) // ゼロ値 false が表示される
	fmt.Println("有効フラグ:", isEnabled)
	fmt.Println("エラーあり？:", hasError)

	// bool 型の値は条件分岐 (if 文) でよく使われる
	if isEnabled {
		fmt.Println("機能が有効です。")
	} else {
		fmt.Println("機能が無効です。")
	}

	if hasError {
		fmt.Println("エラーが発生しました！")
	} else {
		fmt.Println("エラーはありません。")
	}
}

/* 実行結果:
Goは楽しい？: true
学習中？: false
有効フラグ: true
エラーあり？: false
機能が有効です。
エラーはありません。
*/
```

**コード解説:**

*   `bool` 型の変数は、`true` または `false` のどちらかの値を持ちます。これらはGo言語の予約語です。
*   `var isLearning bool` のように初期値を指定せずに宣言した場合、`bool` 型の**ゼロ値**である `false` で初期化されます。
*   `isEnabled := true` のように、`true` や `false` を使って初期化すると、変数は `bool` 型として推論されます。
*   `if` 文の条件式には、`bool` 型の値や、結果が `bool` 型になる式（比較演算子など、次のセクションで説明）を記述します。条件が `true` の場合に `if` ブロック内のコードが実行され、`false` の場合に (もしあれば) `else` ブロック内のコードが実行されます。

`bool` 型はシンプルですが、プログラムの流れを制御する上で非常に重要な役割を果たします。