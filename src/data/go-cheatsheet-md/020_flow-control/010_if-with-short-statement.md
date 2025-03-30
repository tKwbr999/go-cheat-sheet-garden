## タイトル
title: `if` 文と短い初期化ステートメント

## タグ
tags: ["flow-control", "if", "初期化ステートメント", "スコープ"]

## コード
```go
package main

import (
	"fmt"
	"math/rand"
)

func getRandomValue() int {
	return rand.Intn(20) // 0-19 の乱数
}

func main() {
	if value := getRandomValue(); value > 10 {
		fmt.Printf("値 %d は 10 より大きい\n", value)
	} else if value > 5 {
		fmt.Printf("値 %d は 5 より大きく 10 以下\n", value)
	} else {
		fmt.Printf("値 %d は 5 以下\n", value)
	}
	// fmt.Println(value) // エラー: value は if の外では未定義
}

```

## 解説
```text
Goの `if` 文では、条件式を評価する直前に
**短いステートメント**（通常は変数の宣言と初期化）を
実行できます。

**構文:** `if 初期化ステートメント; 条件式 { ... }`

*   **初期化ステートメント:**
    条件評価の**前**に実行されます。
    例: `value := getRandomValue()`
    ここで宣言された変数 (`value`) は、
    続く条件式や `if`, `else if`, `else` ブロック内で
    利用できます。
*   **スコープ:**
    初期化ステートメントで宣言された変数は、
    その `if` 文（関連する `else if`, `else` を含む）の
    **内部でのみ有効**です。
    `if` の外からはアクセスできません。

**利点:**
1.  **スコープ限定:** 条件判断にのみ必要な変数を
    外部に漏らさず、コードが読みやすくなります。
2.  **コード簡潔化:** 変数宣言と条件判断を
    一行で書けます。

特に関数呼び出しの結果をすぐに条件判断したい場合
（エラーチェックなど）によく使われます。