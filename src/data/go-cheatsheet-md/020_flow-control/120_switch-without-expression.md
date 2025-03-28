---
title: "制御構文: 式を省略した `switch` 文"
tags: ["flow-control", "switch", "case", "default", "条件分岐", "if"]
---

Goの `switch` 文は、`switch` キーワードの後に評価する**式を省略**することができます。式を省略した場合、`switch` 文は `switch true` と書いたのと同じように動作します。

この形式では、各 `case` には値ではなく、評価結果が `true` または `false` になる**条件式**を記述します。`switch` 文は上から順番に `case` の条件式を評価し、最初に `true` になった `case` の処理を実行して `switch` 文を終了します。

これは、`if-else if-else` の長い連鎖をより簡潔で読みやすく書くための代替手段として非常に便利です。

## 構文: `switch { case 条件式: ... }`

```go
switch { // switch の後に式がない (switch true と同じ)
case 条件式1:
	// 条件式1 が true の場合の処理
case 条件式2:
	// 条件式1 が false で、条件式2 が true の場合の処理
case 条件式3:
	// 条件式1, 2 が false で、条件式3 が true の場合の処理
default:
	// 上記のどの条件式も true にならなかった場合の処理 (省略可能)
}
```

## コード例 (`if-else if-else` との比較)

点数に応じて成績を判定する処理を、`if-else if-else` と式なし `switch` で書いて比較してみましょう。

**`if-else if-else` の場合:**

```go title="if-else if-else で成績判定"
package main

import "fmt"

func getGradeIf(score int) string {
	grade := "" // または他の初期値
	if score >= 90 {
		grade = "A"
	} else if score >= 80 {
		grade = "B"
	} else if score >= 70 {
		grade = "C"
	} else if score >= 60 {
		grade = "D"
	} else {
		grade = "F"
	}
	return grade
}

func main() {
	fmt.Printf("85点の成績: %s\n", getGradeIf(85))
	fmt.Printf("55点の成績: %s\n", getGradeIf(55))
}

/* 実行結果:
85点の成績: B
55点の成績: F
*/
```

**式なし `switch` の場合:**

```go title="式なし switch で成績判定"
package main

import "fmt"

func getGradeSwitch(score int) string {
	grade := ""
	switch { // 式を省略 (switch true と同じ)
	case score >= 90: // score >= 90 が true か？
		grade = "A"
	case score >= 80: // 上が false で、score >= 80 が true か？
		grade = "B"
	case score >= 70: // 上が false で、score >= 70 が true か？
		grade = "C"
	case score >= 60: // 上が false で、score >= 60 が true か？
		grade = "D"
	default: // 上のどの条件も true にならなかった場合
		grade = "F"
	}
	return grade
}

func main() {
	fmt.Printf("85点の成績: %s\n", getGradeSwitch(85))
	fmt.Printf("55点の成績: %s\n", getGradeSwitch(55))
}

/* 実行結果:
85点の成績: B
55点の成績: F
*/
```

**比較のポイント:**

*   式なし `switch` を使うと、`else if` を繰り返し書く必要がなくなり、コードが縦にすっきりと整列して見えることがあります。
*   各 `case` には `bool` 型になる条件式を書きます。
*   `if-else if-else` と同様に、条件は上から順番に評価され、最初に `true` になった `case` の処理が実行されて `switch` 文が終了します。

どちらの書き方を選ぶかは好みの問題もありますが、特に分岐条件が多い場合に、式なし `switch` がコードの可読性を向上させる有効な選択肢となります。