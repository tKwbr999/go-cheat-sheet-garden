## タイトル
title: 条件分岐 `switch` (基本形)

## タグ
tags: ["flow-control", "switch", "case", "default", "条件分岐"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	today := time.Now().Weekday()
	fmt.Printf("今日は %s です。\n", today)

	switch today {
	case time.Saturday, time.Sunday: // 複数の値を指定
		fmt.Println("週末です！")
	case time.Friday:
		fmt.Println("金曜日！あと一日！")
	default: // 上記以外 (月〜木)
		fmt.Println("平日です。頑張りましょう！")
	}
}
```

## 解説
```text
一つの変数の値に基づいて多数の分岐を行いたい場合、
`if-else if-else` よりも **`switch`** 文が
簡潔に書けることがあります。

**基本構文:**
```go
switch 式 {
case 値1:
    // 式 == 値1 の処理
case 値2, 値3: // 複数指定可
    // 式 == 値2 または 式 == 値3 の処理
default: // 省略可
    // どの case にも一致しない場合の処理
}
```
*   `switch` の `式` の値を評価し、一致する `case` の
    `値` に処理が分岐します。
*   `case` にはカンマ区切りで複数の値を指定できます。
*   `default` はどの `case` にも一致しない場合に実行されます。

**Goの `switch` の特徴:**
1.  **自動フォールスルーなし:** 一致した `case` の処理後、
    自動的に `switch` 文全体が終了します
    (**`break` 不要**)。次の `case` も実行したい場合は
    `fallthrough` を使います (別記)。
2.  `case` の値は定数でなくてもOK (比較可能な型)。

コード例では、`today` の値に応じて処理を分岐しています。
`switch` の式には `score / 10` のような計算式も使えます。

`switch` は特定の値に基づく分岐をすっきりと書ける構文です。