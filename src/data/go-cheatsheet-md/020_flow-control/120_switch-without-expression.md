## タイトル
title: 式を省略した `switch` 文

## タグ
tags: ["flow-control", "switch", "case", "default", "条件分岐", "if"]

## コード
```go
package main

import "fmt"

func getGradeSwitch(score int) string {
	grade := ""
	switch { // 式を省略 (switch true と同じ)
	case score >= 90:
		grade = "A"
	case score >= 80:
		grade = "B"
	case score >= 70:
		grade = "C"
	case score >= 60:
		grade = "D"
	default:
		grade = "F"
	}
	return grade
}

func main() {
	fmt.Printf("85点の成績: %s\n", getGradeSwitch(85)) // B
	fmt.Printf("55点の成績: %s\n", getGradeSwitch(55)) // F
}
```

## 解説
```text
`switch` 文は、`switch` キーワードの後の
**式を省略**できます。
これは `switch true` と書いたのと同じ動作になります。

**構文:** `switch { case 条件式: ... }`

この形式では、各 `case` には値ではなく、
評価結果が `bool` になる**条件式**を書きます。
`switch` 文は上から順に `case` の条件式を評価し、
**最初に `true` になった `case`** の処理を実行して
`switch` 文を終了します。

これは、`if-else if-else` の長い連鎖を
より簡潔で読みやすく書くための代替手段として便利です。

コード例では、`score` の値に基づいて成績を判定しています。
`score` が 85 の場合、`case score >= 90` は `false`、
次の `case score >= 80` が `true` になるため、
`grade` に "B" が設定され、`switch` 文が終了します。

分岐条件が多い場合に、式なし `switch` は
コードの可読性を向上させる有効な選択肢です。