---
title: "データ構造: マップ (Map) をキーでソートして反復処理"
tags: ["data-structures", "マップ", "map", "for range", "ループ", "繰り返し", "ソート", "sort", "順序"]
---

前のセクションで説明したように、マップに対する `for range` ループの反復順序は保証されません。しかし、場合によっては、マップの要素をキーの順序（例えばアルファベット順や数値の昇順）で処理したいことがあります。

Goでは、マップを特定の順序で反復処理するための直接的な機能はありませんが、以下の手順で実現できます。

1.  **キーの抽出:** マップのすべてのキーをスライスに抽出します。
2.  **キーのソート:** 抽出したキースライスを、標準ライブラリの `sort` パッケージを使ってソートします。
3.  **ソート済みキーで反復:** ソートされたキースライスに対して `for range` ループを実行し、そのキーを使ってマップの値にアクセスします。

## コード例: キーのアルファベット順で処理

```go title="マップをキーでソートして反復処理"
package main

import (
	"fmt"
	"sort" // スライスをソートするためのパッケージ
)

func main() {
	// フルーツの在庫数を管理するマップ (順序は不定)
	stock := map[string]int{
		"orange": 0,
		"grape":  15,
		"apple":  10,
		"banana": 25,
	}

	fmt.Println("--- 元のマップ (順序不定) ---")
	for fruit, count := range stock {
		fmt.Printf("%s: %d\n", fruit, count)
	}

	// --- 1. キーの抽出 ---
	// キー (string) を格納するためのスライスを作成
	// 容量を len(stock) で指定しておくと効率が良い
	keys := make([]string, 0, len(stock))
	// for range でキーのみを取得し、スライスに追加
	for k := range stock {
		keys = append(keys, k)
	}
	fmt.Printf("\n抽出したキー (ソート前): %q\n", keys)

	// --- 2. キーのソート ---
	// sort.Strings() 関数を使って文字列スライスをアルファベット順にソート
	sort.Strings(keys)
	fmt.Printf("ソート後のキー: %q\n", keys)

	// --- 3. ソート済みキーで反復 ---
	fmt.Println("\n--- キーのアルファベット順で表示 ---")
	// ソートされた keys スライスに対してループを実行
	for _, fruit := range keys {
		// ソートされたキーを使ってマップの値にアクセス
		count := stock[fruit]
		fmt.Printf("%s: %d\n", fruit, count)
	}

	// --- 数値キーの場合 ---
	scores := map[int]string{
		10: "A",
		5:  "C",
		8:  "B",
	}
	var intKeys []int
	for k := range scores {
		intKeys = append(intKeys, k)
	}
	fmt.Printf("\n数値キー (ソート前): %v\n", intKeys)
	// sort.Ints() 関数を使って int スライスを昇順にソート
	sort.Ints(intKeys)
	fmt.Printf("数値キー (ソート後): %v\n", intKeys)
	fmt.Println("--- 数値キーの昇順で表示 ---")
	for _, key := range intKeys {
		fmt.Printf("%d: %s\n", key, scores[key])
	}
}

/* 実行結果の例 (元のマップの表示順は不定):
--- 元のマップ (順序不定) ---
orange: 0
grape: 15
apple: 10
banana: 25

抽出したキー (ソート前): ["orange" "grape" "apple" "banana"]
ソート後のキー: ["apple" "banana" "grape" "orange"]

--- キーのアルファベット順で表示 ---
apple: 10
banana: 25
grape: 15
orange: 0

数値キー (ソート前): [10 5 8]
数値キー (ソート後): [5 8 10]
--- 数値キーの昇順で表示 ---
5: C
8: B
10: A
*/
```

**コード解説:**

1.  **キーの抽出:**
    *   `keys := make([]string, 0, len(stock))`: キーを格納するための `string` 型スライス `keys` を作成します。`make` の第3引数で容量を `len(stock)` に指定することで、`append` 時のメモリ再確保を最小限に抑えることができます。
    *   `for k := range stock { keys = append(keys, k) }`: `for range` を使ってマップ `stock` のキー `k` のみを取得し、`keys` スライスに追加していきます。
2.  **キーのソート:**
    *   `import "sort"`: ソート機能を使うために `sort` パッケージをインポートします。
    *   `sort.Strings(keys)`: `sort` パッケージの `Strings` 関数は、文字列スライスをインプレース（元のスライスを変更）でアルファベット順（辞書順）にソートします。
    *   数値キーの場合は `sort.Ints(intKeys)` を使います。他にも `sort.Float64s` など、様々な型のスライスをソートする関数が用意されています。また、より複雑なソート条件には `sort.Slice` 関数などが使えます。
3.  **ソート済みキーで反復:**
    *   `for _, fruit := range keys { ... }`: ソートされた `keys` スライスに対して `for range` ループを実行します。
    *   `count := stock[fruit]`: ループ内で得られたキー `fruit` を使って、元のマップ `stock` から対応する値 `count` を取得します。
    *   これにより、キーのアルファベット順でマップの要素を処理することができます。

この「キーを抽出してソートし、そのキーでループする」方法は、マップの要素を特定の順序で処理するための標準的なテクニックです。