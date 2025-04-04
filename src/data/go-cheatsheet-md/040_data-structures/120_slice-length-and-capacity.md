## タイトル
title: スライス (Slice) の長さ (Length) と容量 (Capacity)

## タグ
tags: ["data-structures", "スライス", "slice", "長さ", "len", "容量", "cap", "内部配列", "append"]

## コード
```go
package main

import "fmt"

func main() {
	s0 := []int{0, 1, 2, 3, 4} // len=5, cap=5
	fmt.Printf("s0: %v (len=%d, cap=%d)\n", s0, len(s0), cap(s0))

	// スライス操作 s0[1:3]
	s1 := s0[1:3] // 要素 {1, 2} を参照
	// len = 3 - 1 = 2
	// cap = 5 - 1 = 4 (元の配列の index 1 から最後まで)
	fmt.Printf("s1 = s0[1:3]: %v (len=%d, cap=%d)\n", s1, len(s1), cap(s1))

	// s1 からさらにスライス s3 = s1[:1]
	s3 := s1[:1] // 要素 {1} を参照
	// len = 1 - 0 = 1
	// cap = 4 (s1 と同じ内部配列、同じ開始位置)
	fmt.Printf("s3 = s1[:1]: %v (len=%d, cap=%d)\n", s3, len(s3), cap(s3))

	// append による変化 (容量内)
	s3 = append(s3, 99) // s3 は [1, 99] になる (len=2, cap=4)
	fmt.Printf("s3 append後: %v (len=%d, cap=%d)\n", s3, len(s3), cap(s3))

	// 内部配列共有の影響: s0 も変更される！
	fmt.Printf("s0 影響確認: %v\n", s0) // [0 1 99 3 4]
}

```

## 解説
```text
スライスの**長さ (Length)** と**容量 (Capacity)** は重要概念です。

**長さ (Length): `len(s)`**
*   スライス `s` に現在含まれる要素の数。
*   インデックスアクセス (`s[i]`) は `0` 〜 `len(s)-1` の範囲。

**容量 (Capacity): `cap(s)`**
*   スライス `s` が参照する**内部配列**の、
    スライスの開始位置から数えて利用可能な要素の総数。
*   `append` 時に内部配列の再確保が必要か判断するのに使う。

**スライス操作と長さ/容量:**
`sub := original[low:high]`
*   `len(sub)` は `high - low`。
*   `cap(sub)` は `cap(original) - low`。

コード例 `s1 := s0[1:3]` では、`len(s1)` は `3-1=2`、
`cap(s1)` は `cap(s0)-1 = 5-1=4` となります。
`s3 := s1[:1]` では、`len(s3)` は `1-0=1`、
`cap(s3)` は `cap(s1)-0 = 4` となります。

**`append` と容量:**
*   `append` 時に `len < cap` なら、内部配列の
    `len` 番目以降の領域が使われ、`len` が増えます
    (効率的)。
*   `len == cap` の時に `append` すると、通常は
    より大きな容量を持つ**新しい内部配列**が確保され、
    既存要素がコピーされてから新要素が追加されます
    (コストがかかる)。新しい容量は元の約2倍が多い。

**内部配列共有の影響:**
スライス操作で作成したスライスは元の内部配列を共有します。
コード例で `s3 = append(s3, 99)` を実行すると、
`s3` の容量 (4) は長さ (1) より大きいので、
内部配列の `s3` の次の要素の位置 (元の `s0[2]` に相当) に
99 が書き込まれます。これにより `s0` の値も変更されます。

もし `append` で容量を超えると、新しい内部配列が
確保されるため、それ以降は元の配列/スライスとは
独立します。

長さと容量、`append` 時の挙動の理解は、スライスを
効率的かつ安全に使うために不可欠です。