## タイトル
title: スライス (Slice) のコピー `copy`

## タグ
tags: ["data-structures", "スライス", "slice", "コピー", "copy", "参照", "内部配列"]

## コード
```go
package main

import "fmt"

func main() {
	src := []int{1, 2, 3, 4, 5}
	fmt.Printf("src: %v (len=%d)\n", src, len(src))

	// コピー先を適切なサイズで確保
	dst1 := make([]int, len(src))

	// src から dst1 へコピー
	numCopied := copy(dst1, src)
	fmt.Printf("dst1: %v (len=%d)\n", dst1, len(dst1))
	fmt.Printf("コピー要素数: %d\n", numCopied)

	// dst1 を変更しても src には影響しない (独立したコピー)
	dst1[0] = 99
	fmt.Printf("dst1変更後: %v\n", dst1)
	fmt.Printf("src影響なし: %v\n", src)

	// append を使ったコピー (簡潔な方法)
	dst2 := append([]int(nil), src...)
	fmt.Printf("dst2 (append): %v (len=%d)\n", dst2, len(dst2))
}

```

## 解説
```text
スライス変数同士の代入 (`s2 := s1`) は、
内部配列を共有する参照のコピーです。
要素の**完全なコピー**を持つ独立したスライスを
作成するには、組み込み関数 **`copy`** を使います。

**構文:**
`コピーされた要素数 := copy(コピー先スライス, コピー元スライス)`

*   `コピー元` (`src`) の要素を `コピー先` (`dst`) にコピーします。
*   実際にコピーされる要素数は、`len(dst)` と `len(src)` の
    **小さい方**の数になります。
*   戻り値はコピーされた要素数です。
*   **重要:** `copy` はコピー先 (`dst`) の**長さや容量を
    変更しません**。要素を上書きするだけです。
    コピー元の全要素をコピーするには、**事前に `dst` を
    十分な長さで確保** (`make` 等) する必要があります。

コード例では `dst1 := make([]int, len(src))` で
`src` と同じ長さの `dst1` を用意してから `copy` しています。
これにより `src` の全要素が `dst1` にコピーされ、
`dst1` と `src` は独立します (`dst1[0]` を変更しても `src` は不変)。

**コピー先の長さが足りない場合:**
`dst := make([]int, 3)` に対して `copy(dst, src)` を実行すると、
`dst` の長さ 3 までしかコピーされません (結果: `[1 2 3]`)。

**コピー元の長さが足りない場合:**
`dst := make([]int, 7)` に対して `copy(dst, src)` を実行すると、
`src` の全要素 (5つ) がコピーされ、`dst` の残りはゼロ値のままです
(結果: `[1 2 3 4 5 0 0]`)。

**`append` を使ったコピー:**
`dst := append([]int(nil), src...)` という書き方でも、
`src` と同じ内容を持つ新しい独立したスライスを作成できます。
これは `copy` を使うより簡潔な場合があります。

スライスの内容を独立させたい場合は `copy` 関数
（または `append` テクニック）を使いましょう。