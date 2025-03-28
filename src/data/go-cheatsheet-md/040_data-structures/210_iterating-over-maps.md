---
title: "データ構造: マップ (Map) の反復処理 `for range`"
tags: ["data-structures", "マップ", "map", "for range", "ループ", "繰り返し", "順序不定"]
---

マップに格納されたすべてのキーと値のペアに対して、順番に何らかの処理を行いたい場合があります。Go言語では、**`for range`** ループを使ってマップの要素を簡単に反復処理できます。

## マップでの `for range`

マップに対して `for range` を使うと、各反復でマップ内の**キー**とそれに対応する**値**のペアが返されます。

**構文:** `for キー変数, 値変数 := range マップ { ... ループ本体 ... }`

**非常に重要な注意点:** マップの `for range` ループでは、要素が取り出される**順序は保証されません**。Goの言語仕様として、マップの反復順序はランダム（実行ごとに異なる可能性がある）と定められています。これは、将来的な実装の変更によって特定の順序に依存したコードが壊れるのを防ぐためです。**マップの要素が特定の順序で処理されることを期待してはいけません。**

```go title="マップの for range による反復処理"
package main

import "fmt"

func main() {
	// フルーツの在庫数を管理するマップ
	stock := map[string]int{
		"apple":  10,
		"banana": 25,
		"orange": 0,
		"grape":  15,
	}

	fmt.Println("--- 在庫一覧 (キーと値) ---")
	// キー (fruit) と値 (count) を取得
	for fruit, count := range stock {
		fmt.Printf("%s の在庫: %d 個\n", fruit, count)
	}
	// ★ 実行するたびに、この表示順序が変わる可能性がある！

	fmt.Println("\n--- 在庫のあるフルーツ名 (キーのみ) ---")
	// キー (fruit) のみを取得 (値は無視するか、変数自体を省略)
	for fruit := range stock {
		// 在庫が 0 より大きいかチェック (値へのアクセスは別途必要)
		if stock[fruit] > 0 {
			fmt.Println("-", fruit)
		}
	}

	fmt.Println("\n--- 在庫数の一覧 (値のみ) ---")
	// 値 (count) のみを取得 (キーは _ で無視)
	for _, count := range stock {
		fmt.Printf("在庫数: %d\n", count)
	}

	// マップが nil や空の場合、ループは実行されない
	fmt.Println("\n--- 空マップの場合 ---")
	emptyMap := make(map[int]bool)
	for k, v := range emptyMap {
		fmt.Printf("空マップから取得: %d=%t\n", k, v) // 実行されない
	}
	fmt.Println("空マップのループ完了")
}

/* 実行結果の例 (順序は不定):
--- 在庫一覧 (キーと値) ---
orange の在庫: 0 個
grape の在庫: 15 個
apple の在庫: 10 個
banana の在庫: 25 個

--- 在庫のあるフルーツ名 (キーのみ) ---
- grape
- apple
- banana

--- 在庫数の一覧 (値のみ) ---
在庫数: 0
在庫数: 15
在庫数: 10
在庫数: 25

--- 空マップの場合 ---
空マップのループ完了
*/
```

**コード解説:**

*   `for fruit, count := range stock`: マップ `stock` の各要素について、キーが `fruit` に、値が `count` に代入されてループが実行されます。
*   `for fruit := range stock`: 値を受け取る変数を省略すると、キー (`fruit`) のみが返されます。値が必要な場合は `stock[fruit]` のように再度マップにアクセスする必要があります。
*   `for _, count := range stock`: キーが不要な場合は、ブランク識別子 `_` を使って無視し、値 (`count`) のみを受け取ります。
*   **順序不定:** 上記のどの `for range` でも、要素が処理される順序（表示される順序）は実行ごとに異なる可能性があります。

マップの全要素に対して処理を行う場合、`for range` は非常に便利ですが、処理順序に依存しないようにコードを書くことが重要です。もし特定の順序（キーのアルファベット順など）で処理したい場合は、次のセクションで説明する方法を使います。