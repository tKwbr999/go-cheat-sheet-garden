## タイトル
title: マップ (Map) の反復処理 `for range`

## タグ
tags: ["data-structures", "マップ", "map", "for range", "ループ", "繰り返し", "順序不定"]

## コード
```go
package main

import "fmt"

func main() {
	stock := map[string]int{
		"apple":  10,
		"banana": 25,
		"orange": 0,
		"grape":  15,
	}

	fmt.Println("--- 在庫一覧 (キーと値) ---")
	// キー(fruit)と値(count)を取得
	for fruit, count := range stock {
		fmt.Printf("%s: %d個\n", fruit, count)
	}
	// ★ 順序は保証されない！実行ごとに変わる可能性あり

	fmt.Println("\n--- 在庫のあるフルーツ名 (キーのみ) ---")
	// キー(fruit)のみを取得 (値の変数を省略)
	for fruit := range stock {
		if stock[fruit] > 0 { // 値が必要なら別途アクセス
			fmt.Println("-", fruit)
		}
	}

	// 値のみを取得する場合
	// for _, count := range stock { ... }
}

```

## 解説
```text
マップの全要素に対して処理を行うには **`for range`** を使います。

**構文:** `for キー変数, 値変数 := range マップ { ... }`
各反復でマップ内の**キー**とそれに対応する**値**のペアが返されます。

**重要: 順序は保証されない**
マップの `for range` ループでは、要素が取り出される
**順序は保証されません**。実行ごとに順序が変わる可能性があります。
**特定の順序に依存したコードを書いてはいけません。**

**キー/値の無視:**
*   キーだけが必要な場合: 値の変数を省略します。
    (例: `for fruit := range stock`)
    値が必要な場合は `stock[fruit]` のように再度アクセスします。
*   値だけが必要な場合: キーの変数を `_` で無視します。
    (例: `for _, count := range stock`)

**`nil` / 空マップ:**
`nil` または空のマップに対して `for range` を実行しても
エラーにはならず、ループ本体が一度も実行されないだけです。

マップの全要素処理に `for range` は便利ですが、
順序不定である点に常に注意が必要です。
(特定の順序が必要な場合はキーをソートする等の工夫が必要)