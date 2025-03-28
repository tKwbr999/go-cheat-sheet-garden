---
title: "データ構造: マップを使ったセットの集合演算"
tags: ["data-structures", "マップ", "map", "セット", "set", "集合", "集合演算", "和集合", "積集合", "差集合"]
---

マップを使ってセット（集合）を実装すると、集合演算（和集合、積集合、差集合など）も比較的簡単に実装できます。ここでは `map[T]struct{}` を使ったセットを例に、基本的な集合演算の実装方法を見ていきます。

## 集合演算の定義

*   **和集合 (Union):** 2つのセット `A` と `B` があったとき、`A` または `B` の**少なくとも一方に含まれる**すべての要素からなる集合。`A ∪ B`。
*   **積集合 (Intersection):** 2つのセット `A` と `B` があったとき、`A` と `B` の**両方に共通して含まれる**すべての要素からなる集合。`A ∩ B`。
*   **差集合 (Difference):** 2つのセット `A` と `B` があったとき、`A` には含まれるが `B` には**含まれない**すべての要素からなる集合。`A - B` または `A \ B`。

## コード例: 文字列セットの集合演算

```go title="マップを使った集合演算の実装"
package main

import "fmt"

// --- セットの定義 (簡単のため main 関数内で定義) ---
type StringSet map[string]struct{} // string 型のセット

// --- 集合演算関数 ---

// 和集合 (A ∪ B)
func union(set1, set2 StringSet) StringSet {
	result := make(StringSet) // 結果用の新しいセットを作成
	// set1 の要素をすべて追加
	for element := range set1 {
		result[element] = struct{}{}
	}
	// set2 の要素をすべて追加 (重複は自動的に無視される)
	for element := range set2 {
		result[element] = struct{}{}
	}
	return result
}

// 積集合 (A ∩ B)
func intersection(set1, set2 StringSet) StringSet {
	result := make(StringSet)
	// set1 の各要素について...
	for element := range set1 {
		// ...set2 にも存在するかチェック
		if _, ok := set2[element]; ok {
			// 両方に存在すれば結果に追加
			result[element] = struct{}{}
		}
	}
	return result
}

// 差集合 (A - B)
func difference(set1, set2 StringSet) StringSet {
	result := make(StringSet)
	// set1 の各要素について...
	for element := range set1 {
		// ...set2 に存在しないかチェック
		if _, ok := set2[element]; !ok {
			// set1 にあり、set2 になければ結果に追加
			result[element] = struct{}{}
		}
	}
	return result
}

// --- ヘルパー関数 (セットの表示用) ---
func printSet(name string, set StringSet) {
	fmt.Printf("%s: { ", name)
	elements := []string{}
	for k := range set {
		elements = append(elements, k)
	}
	// 表示順序を安定させるためにソート (オプション)
	// import "sort"
	// sort.Strings(elements)
	fmt.Printf("%v }\n", elements)
}

func main() {
	// 2つのセットを作成
	setA := StringSet{
		"apple":  struct{}{},
		"banana": struct{}{},
		"cherry": struct{}{},
	}
	setB := StringSet{
		"banana": struct{}{},
		"cherry": struct{}{},
		"date":   struct{}{},
	}

	printSet("Set A", setA)
	printSet("Set B", setB)

	// --- 和集合 ---
	unionSet := union(setA, setB)
	printSet("A ∪ B (和集合)", unionSet) // { "apple", "banana", "cherry", "date" }

	// --- 積集合 ---
	intersectionSet := intersection(setA, setB)
	printSet("A ∩ B (積集合)", intersectionSet) // { "banana", "cherry" }

	// --- 差集合 (A - B) ---
	differenceSetA_B := difference(setA, setB)
	printSet("A - B (差集合)", differenceSetA_B) // { "apple" }

	// --- 差集合 (B - A) ---
	differenceSetB_A := difference(setB, setA)
	printSet("B - A (差集合)", differenceSetB_A) // { "date" }
}

/* 実行結果 (表示順序は不定):
Set A: { apple banana cherry }
Set B: { banana cherry date }
A ∪ B (和集合): { apple banana cherry date }
A ∩ B (積集合): { banana cherry }
A - B (差集合): { apple }
B - A (差集合): { date }
*/
```

**コード解説:**

*   `type StringSet map[string]struct{}`: コードの可読性を上げるために、`map[string]struct{}` に `StringSet` という別名を付けています。
*   **`union` 関数:**
    1.  結果を格納するための新しい空のセット `result` を作成します。
    2.  `set1` のすべての要素を `result` に追加します。
    3.  `set2` のすべての要素を `result` に追加します。マップのキーは重複しないため、既に `result` に存在する要素は上書きされるだけで、結果として和集合が得られます。
*   **`intersection` 関数:**
    1.  結果用の新しい空のセット `result` を作成します。
    2.  `set1` の各要素 `element` についてループします。
    3.  カンマOKイディオム `_, ok := set2[element]` を使って、その `element` が `set2` にも存在するか (`ok` が `true` か）をチェックします。
    4.  もし `set2` にも存在すれば、その `element` を `result` に追加します。
*   **`difference` 関数 (A - B):**
    1.  結果用の新しい空のセット `result` を作成します。
    2.  `set1` の各要素 `element` についてループします。
    3.  カンマOKイディオム `_, ok := set2[element]` を使って、その `element` が `set2` に存在するかをチェックします。
    4.  もし `set2` に**存在しなければ** (`!ok` が `true` ならば）、その `element` を `result` に追加します。
*   `printSet` 関数: セットの内容を分かりやすく表示するためのヘルパー関数です。マップのキーをスライスに集めて表示しています（オプションでソートも可能）。

このように、マップの基本的な操作（追加、存在確認、反復処理）を組み合わせることで、標準的な集合演算を実装することができます。