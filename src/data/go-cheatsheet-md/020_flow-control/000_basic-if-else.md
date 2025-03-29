## タイトル
title: 条件分岐 `if`, `else if`, `else`

## タグ
tags: ["flow-control", "if", "else if", "else", "条件分岐"]

## コード
```go
package main

import "fmt"

func main() {
	temperature := 25

	if temperature >= 30 {
		fmt.Println("暑いですね！")
	} else if temperature >= 15 {
		fmt.Println("過ごしやすい気温です。")
	} else if temperature >= 0 {
		fmt.Println("少し肌寒いですね。")
	} else {
		fmt.Println("とても寒いです！")
	}
}
```

## 解説
```text
プログラムは通常上から下に実行されますが、
**条件**に応じて処理を変えたい場合に
**条件分岐**を使います。Goでは `if` 文が基本です。

**`if` 文の基本:**
`if 条件式 { ... }`
条件式 (結果が `bool` になる式) が `true` なら
`{}` 内のコードを実行します。
*   Goでは条件式を囲む `()` は不要。
*   `{}` は必須 (処理が1行でも)。
*   `if` と `{` は同じ行に書く。

**`else`: 条件が偽の場合**
`if 条件式 { ... } else { ... }`
`if` の条件が `false` の場合に `else` ブロックが
実行されます。`else` は `if` の `}` と同じ行に書きます。

**`else if`: 複数の条件を順番に評価**
`if 条件1 { ... } else if 条件2 { ... } else { ... }`
*   `else if` はいくつでも繋げられます。
*   条件は上から順に評価され、最初に `true` になった
    ブロックだけが実行されます。
*   どの条件も `false` なら最後の `else` が実行されます
    (最後の `else` は省略可能)。

コード例では `temperature` が 25 なので、
`temperature >= 30` は `false`。
次の `temperature >= 15` が `true` になるため、
「過ごしやすい気温です。」が出力され、
それ以降の `else if`, `else` は評価されません。