---
title: "制御構文: `switch` 文での `fallthrough`"
tags: ["flow-control", "switch", "case", "fallthrough"]
---

Goの `switch` 文は、他の多くの言語とは異なり、一致した `case` の処理が終わると自動的に `switch` 文全体が終了します（暗黙的な `break` があるような動作）。これは通常、意図しない処理の継続を防ぐための安全な挙動です。

しかし、稀に、ある `case` の処理を実行した後、**意図的に次の `case` の処理も続けて実行したい**場合があります。このような場合に使うのが **`fallthrough`** キーワードです。

## `fallthrough` の使い方

`fallthrough` は、`case` ブロックの最後に記述します。これが実行されると、制御は**無条件に**次の `case` ブロックの先頭に移り、その処理を実行します。

**重要な注意点:** `fallthrough` は、次の `case` の**条件式を評価しません**。単に、次の `case` の処理ブロックにジャンプするだけです。

```go title="fallthrough の使用例"
package main

import "fmt"

func main() {
	number := 2

	fmt.Printf("数値 %d の評価:\n", number)

	switch number {
	case 1:
		fmt.Println(" - case 1 の処理")
	case 2:
		fmt.Println(" - case 2 の処理")
		fallthrough // ★ 次の case 3 に処理を続ける
	case 3:
		// number が 2 であっても、fallthrough によってここが実行される
		// case 3 の条件 (number == 3) は評価されない！
		fmt.Println(" - case 3 の処理 (fallthrough により実行)")
	case 4:
		fmt.Println(" - case 4 の処理")
		fallthrough // ★ 次の default に処理を続ける
	default:
		// case 4 から fallthrough してきた場合もここが実行される
		fmt.Println(" - default の処理 (case 4 から fallthrough)")
	}

	fmt.Println("\n別の例 (文字列):")
	s := "apple"
	switch s {
	case "apple":
		fmt.Println(" - リンゴです")
		fallthrough // 次の case "fruit" へ
	case "banana":
		fmt.Println(" - バナナです")
		// fallthrough は case の最後のステートメントである必要はないが、
		// 通常は最後に書かれることが多い
	case "fruit": // s が "apple" でも fallthrough でここに来る
		fmt.Println(" - これは果物です")
	default:
		fmt.Println(" - 知らないものです")
	}
}

/* 実行結果:
数値 2 の評価:
 - case 2 の処理
 - case 3 の処理 (fallthrough により実行)

別の例 (文字列):
 - リンゴです
 - これは果物です
*/
```

**コード解説:**

*   `number` が `2` の場合、`case 2:` が一致し、「- case 2 の処理」が出力されます。
*   `case 2:` の最後に `fallthrough` があるため、`switch` 文は終了せず、**条件に関係なく**次の `case 3:` の処理ブロックに移ります。
*   「- case 3 の処理 (fallthrough により実行)」が出力されます。`case 3:` には `fallthrough` がないので、ここで `switch` 文は終了します。
*   `s` が `"apple"` の場合、`case "apple":` が一致し、「- リンゴです」が出力されます。
*   `fallthrough` により、次の `case "fruit":` の処理ブロックに移り、「- これは果物です」が出力されて `switch` 文が終了します。

## `fallthrough` の使用は慎重に

Goの `switch` がデフォルトでフォールスルーしない設計になっているのは、それがバグの原因になりやすいと考えられているためです。`fallthrough` は、そのデフォルトの挙動を覆すものであり、コードを読む人がその意図を明確に理解できるように使う必要があります。

多くの場合、`fallthrough` を使わずに、複数の値を一つの `case` で処理したり (`case val1, val2:`)、関数を呼び出したりすることで、より明確なコードを書くことができます。

`fallthrough` は Go の機能として存在しますが、実際のコードで見かけることは比較的少なく、使用する際にはその必要性をよく検討し、コメントなどで意図を補足することが推奨されます。