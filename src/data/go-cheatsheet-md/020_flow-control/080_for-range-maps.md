## タイトル
title: 制御構文: `for range` ループ (マップ)

## タグ
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "マップ", "map"]

## コード
```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"Alice": 85,
		"Bob":   92,
		"Carol": 78,
	}

	fmt.Println("--- マップのキーと値 ---")
	// キー(name)と値(score)を取得
	for name, score := range scores {
		fmt.Printf("名前: %s, 点数: %d\n", name, score)
	}
	// 順序は保証されない！

	fmt.Println("\n--- キーだけを使う場合 ---")
	// 値を受け取る変数を省略するとキーのみ取得
	for name := range scores {
		fmt.Printf("名前: %s\n", name)
	}

	// 値だけを使う場合
	// for _, score := range scores { ... }
}

```

## 解説
```text
`for range` ループは**マップ (map)** の要素を
反復処理するためにも使われます。

**構文:** `for キー変数, 値変数 := range マップ { ... }`
各反復で**キー**とそのキーに対応する**値**のペアが返されます。

**重要な注意点: 順序は保証されない**
マップの `for range` では、要素が取り出される
**順序は保証されません**。
実行するたびに順序が変わる可能性があります。
特定の順序で処理したい場合は、先にキーを取り出して
ソートするなどの工夫が必要です。

**キー/値の無視:**
*   キーだけが必要な場合: 値の変数を省略します。
    (例: `for name := range scores`)
*   値だけが必要な場合: キーの変数を `_` で無視します。
    (例: `for _, score := range scores`)

**`nil` / 空マップ:**
`nil` または空のマップに対して `for range` を実行しても
エラーにはならず、ループ本体が一度も実行されないだけです。

マップの全要素を処理する際に便利ですが、
順序不定である点に注意しましょう。