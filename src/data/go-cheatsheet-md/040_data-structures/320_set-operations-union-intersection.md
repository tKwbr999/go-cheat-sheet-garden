## タイトル
title: データ構造: マップを使ったセットの集合演算

## タグ
tags: ["data-structures", "マップ", "map", "セット", "set", "集合", "集合演算", "和集合", "積集合", "差集合"]

## コード
```go
package main

import "fmt"

// セットの型定義 (map[string]struct{})
type StringSet map[string]struct{}

// 和集合 (A ∪ B)
func union(set1, set2 StringSet) StringSet {
	result := make(StringSet)
	for element := range set1 { // set1 の要素を追加
		result[element] = struct{}{}
	}
	for element := range set2 { // set2 の要素を追加 (重複は無視される)
		result[element] = struct{}{}
	}
	return result
}

// (積集合、差集合の実装は解説参照)

func main() {
	setA := StringSet{"apple": {}, "banana": {}, "cherry": {}}
	setB := StringSet{"banana": {}, "cherry": {}, "date": {}}

	fmt.Printf("Set A: %v\n", setA)
	fmt.Printf("Set B: %v\n", setB)

	// 和集合の実行例
	unionSet := union(setA, setB)
	fmt.Printf("A ∪ B: %v\n", unionSet)
}

```

## 解説
```text
マップ (`map[T]struct{}`) を使って実装したセットに対し、
集合演算（和集合、積集合、差集合）を実装できます。

**集合演算の定義:**
*   **和集合 (Union: A ∪ B):** A または B の少なくとも一方に含まれる要素。
*   **積集合 (Intersection: A ∩ B):** A と B の両方に含まれる要素。
*   **差集合 (Difference: A - B):** A に含まれ B に含まれない要素。

**実装方法:**

*   **和集合 (`union`, コード例参照):**
    1. 新しい結果セット `result` を作成。
    2. `set1` の全要素を `result` に追加。
    3. `set2` の全要素を `result` に追加 (重複はマップが自動処理)。
    4. `result` を返す。

*   **積集合 (`intersection`):**
    1. 新しい結果セット `result` を作成。
    2. `set1` の各要素 `e` についてループ。
    3. `set2` にも `e` が存在するかカンマOK (`_, ok := set2[e]`) で確認。
    4. `ok` が `true` なら `e` を `result` に追加。
    5. `result` を返す。

*   **差集合 (`difference`, A - B):**
    1. 新しい結果セット `result` を作成。
    2. `set1` の各要素 `e` についてループ。
    3. `set2` に `e` が存在するかカンマOK (`_, ok := set2[e]`) で確認。
    4. `ok` が `false` なら (存在しなければ) `e` を `result` に追加。
    5. `result` を返す。

マップの基本操作を組み合わせることで、
標準的な集合演算を実装できます。