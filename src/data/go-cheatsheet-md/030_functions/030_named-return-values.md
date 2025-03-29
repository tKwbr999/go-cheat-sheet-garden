## タイトル
title: 名前付き戻り値 (Named Return Values)

## タグ
tags: ["functions", "func", "戻り値", "return", "naked return"]

## コード
```go
package main

import (
	"errors"
	"fmt"
)

// 戻り値に名前 (quotient, remainder, err) を付ける
func divideAndRemainderNamed(a, b int) (quotient, remainder int, err error) {
	// 関数開始時、quotient=0, remainder=0, err=nil で初期化

	if b == 0 {
		err = errors.New("ゼロ除算エラー")
		return // Naked Return: (0, 0, エラー情報) が返る
	}

	quotient = a / b
	remainder = a % b
	// err は nil のまま
	return // Naked Return: (商, 余り, nil) が返る
}

func main() {
	q1, r1, err1 := divideAndRemainderNamed(10, 3)
	if err1 != nil { fmt.Println("エラー:", err1) } else { fmt.Printf("10/3: 商%d, 余り%d\n", q1, r1) }

	_, _, err2 := divideAndRemainderNamed(5, 0) // 戻り値は使わないがエラーはチェック
	if err2 != nil { fmt.Println("エラー:", err2) }
}

```

## 解説
```text
Goの関数では、戻り値に**名前**を付けることができます
(**名前付き戻り値**)。

**構文:**
`func 関数名(...) (戻り値名1 型1, 戻り値名2 型2, ...)`

*   戻り値の変数名とその型を指定します。
*   関数開始時、これらの戻り値変数はそれぞれの
    **ゼロ値**で初期化され、関数内でローカル変数のように
    値を代入できます。

**Naked Return:**
名前付き戻り値を使っている場合、`return` 文で
返す値を**省略**できます (`return` とだけ書く)。
この場合、その時点での名前付き戻り値変数の
現在の値が自動的に返されます。

コード例では `divideAndRemainderNamed` 関数で
`quotient`, `remainder`, `err` という名前付き戻り値を
宣言しています。エラー時は `err` に値を代入して `return`、
正常時は `quotient`, `remainder` に値を代入して `return`
しています (Naked Return)。

**利点:**
*   **ドキュメント:** 戻り値の名前が関数の意図を明確にする
    場合がある (特に複数の同じ型を返す時)。
*   **簡潔化:** 短い関数なら Naked Return で少し簡潔になる。

**注意点 (Naked Return の乱用):**
*   **可読性低下:** 長い関数で Naked Return を多用すると、
    `return` 時点でどの値が返るか分かりにくくなる。
*   **意図しない値:** 戻り値変数を変更後、意図せず
    Naked Return してしまう可能性。

**推奨:**
一般的に、**Naked Return は短い単純な関数でのみ使用**し、
それ以外では**`return` で返す値を明示的に指定する**方が、
コードの明確さと保守性の観点から推奨されます。
名前付き戻り値自体はドキュメント目的で有効です。