## タイトル
title: 真偽値 (Boolean)

## タグ
tags: ["basic-types", "真偽値", "bool", "true", "false"]

## コード
```go
package main

import "fmt"

func main() {
	var isGoFun bool = true
	var isLearning bool // ゼロ値は false

	isEnabled := true
	hasError := false

	fmt.Println("Goは楽しい？:", isGoFun)
	fmt.Println("学習中？:", isLearning)
	fmt.Println("有効フラグ:", isEnabled)
	fmt.Println("エラーあり？:", hasError)

	if isEnabled {
		fmt.Println("機能が有効です。")
	} else {
		fmt.Println("機能が無効です。")
	}

	if !hasError { // ! は否定演算子
		fmt.Println("エラーはありません。")
	}
}
```

## 解説
```text
**真偽値 (Boolean)** 型 (`bool`) は、
「はい/いいえ」「真/偽」のような
二つの状態を表す型です。
値は **`true`** (真) または **`false`** (偽) の
どちらかのみです。

**用途:**
条件分岐 (`if` 文)、ループ制御、
フラグ管理などに不可欠です。

**宣言方法:**
`var` や `:=` を使って宣言できます。
*   `var isGoFun bool = true` (型明示)
*   `var isLearning bool` (ゼロ値 `false` で初期化)
*   `isEnabled := true` (型推論)

**ゼロ値:**
`bool` 型のゼロ値は `false` です。

**`if` 文での利用:**
`if` 文の条件には `bool` 型の値や
結果が `bool` になる式を記述します。
条件が `true` なら `if` ブロック、
`false` なら (あれば) `else` ブロックが
実行されます。
`!` 演算子を使うと `bool` 値を反転できます
(例: `!hasError` は `hasError` が `false` の時に `true`)。