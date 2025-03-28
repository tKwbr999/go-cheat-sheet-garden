---
title: "制御構文: 条件分岐 `switch` (基本形)"
tags: ["flow-control", "switch", "case", "default", "条件分岐"]
---

`if-else if-else` 文は多くの条件を扱うのに便利ですが、一つの変数の値に基づいて多数の分岐を行いたい場合、コードが冗長になることがあります。このような場合に、より簡潔に条件分岐を記述できるのが **`switch`** 文です。

## `switch` 文の基本構文

`switch` 文は、指定された**式**の値を評価し、その値に一致する **`case`** ラベルに処理を分岐させます。

**構文:**
```go
switch 式 {
case 値1:
	// 式の値が 値1 と一致する場合の処理
case 値2, 値3: // 複数の値をカンマで区切って指定可能
	// 式の値が 値2 または 値3 と一致する場合の処理
case 値4:
	// 式の値が 値4 と一致する場合の処理
default:
	// 上記のどの case にも一致しなかった場合の処理 (省略可能)
}
```

*   `switch 式`: 評価する式を記述します。この式の値が各 `case` の値と比較されます。
*   `case 値:`: `switch` の式の値と比較する値を指定します。値が一致した場合、この `case` に続く処理が実行されます。
*   複数の値を一つの `case` で扱いたい場合は、カンマ `,` で区切って列挙します (`case 値2, 値3:` のように）。
*   `default:`: どの `case` の値にも一致しなかった場合に実行される処理を記述します。`default` 節は省略可能です。

**Goの `switch` の重要な特徴:**

1.  **自動的なフォールスルー (Fallthrough) がない:** 他の言語（C言語やJavaなど）の `switch` とは異なり、Goでは一致した `case` の処理が実行されると、**自動的に `switch` 文全体が終了**します。明示的に `break` を書く必要はありません。もし意図的に次の `case` の処理も実行したい場合は、`fallthrough` キーワードを使います（後のセクションで説明）。
2.  `case` の値は定数である必要はありません（ただし、比較可能な型である必要があります）。

## コード例

```go title="基本的な switch 文の使用例"
package main

import (
	"fmt"
	"time"
)

func main() {
	// 曜日の例 (time.Weekday() は曜日を表す型を返す)
	today := time.Now().Weekday() // 現在の曜日を取得

	fmt.Printf("今日は %s です。\n", today) // %s で Weekday 型を文字列表示

	switch today {
	case time.Saturday: // today の値が time.Saturday と一致するか？
		fmt.Println("週末です！ゆっくり休みましょう。")
	case time.Sunday: // today の値が time.Sunday と一致するか？
		fmt.Println("週末です！明日からに備えましょう。")
	case time.Monday, time.Tuesday, time.Wednesday, time.Thursday: // 複数の値を指定
		fmt.Println("平日です。頑張りましょう！")
	case time.Friday:
		fmt.Println("金曜日！あと一日！")
	default: // 上記のどれにも一致しない場合 (通常は発生しないはず)
		fmt.Println("不明な曜日です。")
	}

	// 数値の例
	score := 75
	fmt.Printf("\n点数: %d\n", score)
	switch score / 10 { // 10で割った商で評価
	case 10, 9: // 90点以上
		fmt.Println("評価: 優")
	case 8: // 80点台
		fmt.Println("評価: 良")
	case 7, 6: // 60, 70点台
		fmt.Println("評価: 可")
	default: // 59点以下
		fmt.Println("評価: 不可")
	}
}

/* 実行結果 (実行する曜日によって変わります):
今日は Friday です。 (例)
金曜日！あと一日！

点数: 75
評価: 可
*/
```

**コード解説:**

*   曜日の例では、`time.Now().Weekday()` が返す値 (`today`) を `switch` で評価しています。
*   `case time.Saturday:` や `case time.Sunday:` のように、`today` の値と比較する値を指定します。
*   `case time.Monday, time.Tuesday, ...:` のように、カンマで区切ることで複数の値を一つの `case` で処理できます。
*   一致した `case` の処理が終わると、自動的に `switch` 文が終了します (`break` は不要です）。
*   点数の例では、`score / 10` の結果（整数の除算なので小数点以下切り捨て）を使って評価を分岐させています。

`switch` 文は、特定の値に基づいて処理を分岐させたい場合に、`if-else if-else` よりもコードをすっきりと見やすく書くことができる便利な構文です。