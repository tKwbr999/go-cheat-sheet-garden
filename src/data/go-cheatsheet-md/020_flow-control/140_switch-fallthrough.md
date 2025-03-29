## タイトル
title: 制御構文: `switch` 文での `fallthrough`

## タグ
tags: ["flow-control", "switch", "case", "fallthrough"]

## コード
```go
package main

import "fmt"

func main() {
	number := 2
	fmt.Printf("数値 %d の評価:\n", number)

	switch number {
	case 1:
		fmt.Println(" - case 1")
	case 2:
		fmt.Println(" - case 2")
		fallthrough // 次の case 3 へ
	case 3:
		fmt.Println(" - case 3 (fallthrough)") // number==2 でも実行される
	case 4:
		fmt.Println(" - case 4")
		fallthrough // 次の default へ
	default:
		fmt.Println(" - default (case 4 から fallthrough)")
	}
}
```

## 解説
```text
Goの `switch` は、一致した `case` の処理が終わると
自動的に `switch` 文が終了します (暗黙の `break`)。

稀に、ある `case` の処理後、**意図的に次の `case` の
処理も続けたい**場合に **`fallthrough`** を使います。

**使い方:**
`case` ブロックの最後に `fallthrough` を記述します。
実行されると、制御は**無条件に**次の `case` ブロックの
先頭に移ります。

**重要:** `fallthrough` は、次の `case` の
**条件式を評価しません**。単に次の処理ブロックへ
ジャンプするだけです。

コード例で `number` が `2` の場合:
1. `case 2:` が一致し、「- case 2」が出力される。
2. `fallthrough` により、次の `case 3:` に移る。
3. `case 3:` の条件 (`number == 3`) は評価されず、
   「- case 3 (fallthrough)」が出力される。
4. `case 3:` に `fallthrough` はないので `switch` 終了。

**使用は慎重に:**
Goがデフォルトでフォールスルーしないのは、
それがバグの原因になりやすいためです。
`fallthrough` はその挙動を覆すため、
意図が明確でないと混乱を招く可能性があります。

多くの場合、`fallthrough` を使わずに、
複数の値を `case` で処理 (`case val1, val2:`) したり、
関数を呼び出す方が明確なコードになります。
使用する際は必要性をよく検討し、コメントで
意図を補足することが推奨されます。