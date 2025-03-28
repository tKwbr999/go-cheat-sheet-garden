---
title: "データ構造: スライス (Slice) のコピー `copy`"
tags: ["data-structures", "スライス", "slice", "コピー", "copy", "参照", "内部配列"]
---

スライス変数同士を代入 (`s2 := s1`) すると、スライスのヘッダ情報（ポインタ、長さ、容量）だけがコピーされ、内部配列は共有されたままになります。そのため、`s2` を通じて要素を変更すると `s1` にも影響が出ます。

元のスライスとは独立した、要素の**完全なコピー**を持つ新しいスライスを作成したい場合は、組み込み関数の **`copy`** を使います。

## `copy` 関数の使い方

**構文:** `コピーされた要素数 := copy(コピー先スライス, コピー元スライス)`

*   `copy` 関数は、`コピー元スライス` (`src`) の要素を `コピー先スライス` (`dst`) にコピーします。
*   実際にコピーされる要素の数は、`len(dst)` と `len(src)` のうち、**小さい方**の数になります。
*   `copy` 関数は、実際にコピーされた要素の数を `int` 型で返します。
*   **重要:** `copy` 関数は、コピー先 (`dst`) のスライスの**長さや容量を変更しません**。コピー先の要素を上書きするだけです。そのため、コピー元の要素をすべてコピーしたい場合は、**事前にコピー先のスライスを十分な長さで確保しておく**必要があります（通常は `make` を使います）。

```go title="copy 関数によるスライスのコピー"
package main

import "fmt"

func printSliceInfo(name string, s []int) {
	fmt.Printf("%s: %v (len=%d, cap=%d)\n", name, s, len(s), cap(s))
}

func main() {
	// コピー元のスライス
	src := []int{1, 2, 3, 4, 5}
	printSliceInfo("src", src)

	// --- コピー先を適切なサイズで確保してコピー ---
	// src と同じ長さの dst スライスを作成
	dst1 := make([]int, len(src))
	// src から dst1 へコピー
	numCopied1 := copy(dst1, src)
	fmt.Printf("\n--- dst1 = make([]int, len(src)); copy(dst1, src) ---\n")
	printSliceInfo("dst1", dst1)
	fmt.Printf("コピーされた要素数: %d\n", numCopied1)

	// dst1 を変更しても src には影響しない
	dst1[0] = 99
	printSliceInfo("dst1 (変更後)", dst1)
	printSliceInfo("src (影響なし)", src)

	// --- コピー先の長さが足りない場合 ---
	// 長さ 3 の dst スライスを作成
	dst2 := make([]int, 3)
	// src から dst2 へコピー (dst2 の長さ 3 までしかコピーされない)
	numCopied2 := copy(dst2, src)
	fmt.Printf("\n--- dst2 = make([]int, 3); copy(dst2, src) ---\n")
	printSliceInfo("dst2", dst2) // 先頭 3 要素 [1 2 3] がコピーされる
	fmt.Printf("コピーされた要素数: %d\n", numCopied2)

	// --- コピー元の長さが足りない場合 ---
	// 長さ 7 の dst スライスを作成
	dst3 := make([]int, 7)
	// src から dst3 へコピー (src の長さ 5 までしかコピーされない)
	numCopied3 := copy(dst3, src)
	fmt.Printf("\n--- dst3 = make([]int, 7); copy(dst3, src) ---\n")
	printSliceInfo("dst3", dst3) // 先頭 5 要素 [1 2 3 4 5] がコピーされ、残りはゼロ値 0
	fmt.Printf("コピーされた要素数: %d\n", numCopied3)

	// --- append を使ったコピー (より簡潔な場合も) ---
	// src と同じ要素を持つ新しいスライスを作成する別の方法
	// nil スライスに対して src の要素を append する
	dst4 := append([]int(nil), src...) // または dst4 := append(make([]int, 0, len(src)), src...)
	fmt.Printf("\n--- dst4 := append([]int(nil), src...) ---\n")
	printSliceInfo("dst4", dst4)
	// dst4 を変更しても src には影響しない
	dst4[0] = 77
	printSliceInfo("dst4 (変更後)", dst4)
	printSliceInfo("src (影響なし)", src)
}

/* 実行結果:
src: [1 2 3 4 5] (len=5, cap=5)

--- dst1 = make([]int, len(src)); copy(dst1, src) ---
dst1: [1 2 3 4 5] (len=5, cap=5)
コピーされた要素数: 5
dst1 (変更後): [99 2 3 4 5] (len=5, cap=5)
src (影響なし): [1 2 3 4 5] (len=5, cap=5)

--- dst2 = make([]int, 3); copy(dst2, src) ---
dst2: [1 2 3] (len=3, cap=3)
コピーされた要素数: 3

--- dst3 = make([]int, 7); copy(dst3, src) ---
dst3: [1 2 3 4 5 0 0] (len=7, cap=7)
コピーされた要素数: 5

--- dst4 := append([]int(nil), src...) ---
dst4: [1 2 3 4 5] (len=5, cap=5)
dst4 (変更後): [77 2 3 4 5] (len=5, cap=5)
src (影響なし): [1 2 3 4 5] (len=5, cap=5)
*/
```

**コード解説:**

*   `dst1 := make([]int, len(src))`: コピー先 `dst1` をコピー元 `src` と同じ長さで作成します。
*   `numCopied1 := copy(dst1, src)`: `src` の全要素が `dst1` にコピーされ、`numCopied1` には 5 が入ります。`dst1` と `src` は独立したスライスになります。
*   `dst2 := make([]int, 3)`: 長さ 3 のコピー先 `dst2` を作成します。
*   `numCopied2 := copy(dst2, src)`: `src` の要素を `dst2` にコピーしますが、`dst2` の長さが 3 なので、最初の 3 要素 (`1, 2, 3`) だけがコピーされ、`numCopied2` には 3 が入ります。
*   `dst3 := make([]int, 7)`: 長さ 7 のコピー先 `dst3` を作成します。
*   `numCopied3 := copy(dst3, src)`: `src` の要素を `dst3` にコピーしますが、`src` の長さが 5 なので、5 要素 (`1, 2, 3, 4, 5`) だけがコピーされ、`numCopied3` には 5 が入ります。`dst3` の残りの要素はゼロ値 `0` のままです。
*   `dst4 := append([]int(nil), src...)`: `nil` スライスに対して `src` の全要素を `append` することで、`src` と同じ内容を持つ新しいスライス `dst4` を作成するテクニックです。これも要素のコピーが行われます。

スライスの内容を完全に独立させたい場合は、代入 (`=`) ではなく `copy` 関数（または `append` を使ったテクニック）を使う必要があります。