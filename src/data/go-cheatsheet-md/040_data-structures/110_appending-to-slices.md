---
title: "データ構造: スライス (Slice) への要素の追加 `append`"
tags: ["data-structures", "スライス", "slice", "append", "可変長", "容量", "内部配列"]
---

スライスの最も強力な特徴の一つは、その**可変長**性です。組み込み関数の **`append`** を使うことで、スライスの末尾に新しい要素を一つまたは複数追加することができます。

## `append` 関数の使い方

**構文:** `新しいスライス := append(元のスライス, 追加する要素1, 追加する要素2, ...)`

*   `append` は、第一引数に要素を追加したい元のスライスを、第二引数以降に追加したい要素を**可変長引数**として受け取ります。
*   `append` は、要素が追加された**新しいスライス**を返します。
*   **重要:** `append` は元のスライスを直接変更するとは限りません。特に、元のスライスの容量 (capacity) が足りずに内部配列の再確保が発生した場合、`append` は**新しい内部配列を持つ新しいスライス**を返します。そのため、`append` の結果は**必ず元のスライス変数に再代入**する必要があります (`slice = append(slice, ...)`)。

## コード例

```go title="append による要素の追加"
package main

import "fmt"

func printSliceInfo(name string, s []int) {
	// スライスの情報を表示するヘルパー関数
	fmt.Printf("%s: %v (len=%d, cap=%d)\n", name, s, len(s), cap(s))
}

func main() {
	var s []int // nil スライスで開始
	printSliceInfo("s (初期)", s)

	// --- 要素を1つずつ追加 ---
	s = append(s, 0) // nil スライスに 0 を追加
	printSliceInfo("s (append 0)", s)

	s = append(s, 1) // [0] に 1 を追加
	printSliceInfo("s (append 1)", s)

	// --- 複数の要素を一度に追加 ---
	s = append(s, 2, 3, 4) // [0, 1] に 2, 3, 4 を追加
	printSliceInfo("s (append 2,3,4)", s)

	// --- 容量の変化 ---
	// append は、容量が足りなくなると、より大きな容量を持つ新しい内部配列を確保し、
	// そこに既存の要素をコピーしてから新しい要素を追加する。
	// 容量の増加量は Go の実装によって異なるが、通常は現在の容量の約2倍になることが多い。
	fmt.Println("\n--- 容量の変化 ---")
	sCap := make([]int, 0, 2) // 長さ 0, 容量 2 のスライス
	printSliceInfo("sCap (初期)", sCap)
	sCap = append(sCap, 1)
	printSliceInfo("sCap (append 1)", sCap) // len=1, cap=2
	sCap = append(sCap, 2)
	printSliceInfo("sCap (append 2)", sCap) // len=2, cap=2
	sCap = append(sCap, 3) // 容量が足りないので新しい内部配列が確保される (容量が増える)
	printSliceInfo("sCap (append 3)", sCap) // len=3, cap=4 (またはそれ以上)

	// --- 別のスライスの全要素を追加 ---
	fmt.Println("\n--- スライスの連結 ---")
	sA := []int{1, 2}
	sB := []int{3, 4, 5}
	// sB の要素を展開して sA に追加する (sB...)
	sA = append(sA, sB...)
	printSliceInfo("sA (append sB...)", sA)
}

/* 実行結果 (容量の増加は環境/バージョンにより異なる可能性あり):
s (初期): [] (len=0, cap=0)
s (append 0): [0] (len=1, cap=1)
s (append 1): [0 1] (len=2, cap=2)
s (append 2,3,4): [0 1 2 3 4] (len=5, cap=6)

--- 容量の変化 ---
sCap (初期): [] (len=0, cap=2)
sCap (append 1): [1] (len=1, cap=2)
sCap (append 2): [1 2] (len=2, cap=2)
sCap (append 3): [1 2 3] (len=3, cap=4)

--- スライスの連結 ---
sA (append sB...): [1 2 3 4 5] (len=5, cap=6)
*/
```

**コード解説:**

*   `s = append(s, 0)`: `nil` スライス `s` に `0` を追加します。新しい内部配列が確保され、`s` は `[0]` (len=1, cap=1) になります。
*   `s = append(s, 1)`: `s` に `1` を追加します。容量が足りないので、新しい内部配列（容量2）が確保され、`s` は `[0 1]` (len=2, cap=2) になります。
*   `s = append(s, 2, 3, 4)`: `s` に 2, 3, 4 を追加します。容量が足りないので、新しい内部配列（容量6など）が確保され、`s` は `[0 1 2 3 4]` (len=5, cap=6) になります。
*   `sCap` の例では、`append(sCap, 3)` の時点で容量 2 が足りなくなり、より大きな容量（例: 4）を持つ新しい内部配列が確保されていることがわかります。
*   `sA = append(sA, sB...)`: スライス `sB` の**全要素**を `sA` に追加しています。スライス変数の後に `...` を付けることで、その要素を展開して `append` の可変長引数として渡すことができます。

`append` はスライスを動的に拡張するための基本的な関数です。内部配列の再確保が発生する可能性があるため、パフォーマンスが重要な場面では、`make` で初期容量を適切に指定しておくことが有効な場合があります。