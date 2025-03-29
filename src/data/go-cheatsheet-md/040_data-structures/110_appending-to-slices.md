## タイトル
title: データ構造: スライス (Slice) への要素の追加 `append`

## タグ
tags: ["data-structures", "スライス", "slice", "append", "可変長", "容量", "内部配列"]

## コード
```go
package main

import "fmt"

func main() {
	var s []int // nil スライス
	fmt.Printf("初期: %v (len=%d, cap=%d)\n", s, len(s), cap(s))

	// 要素を1つ追加
	s = append(s, 0)
	fmt.Printf("append 0: %v (len=%d, cap=%d)\n", s, len(s), cap(s))

	// さらに要素を1つ追加
	s = append(s, 1)
	fmt.Printf("append 1: %v (len=%d, cap=%d)\n", s, len(s), cap(s))

	// 複数の要素を一度に追加
	s = append(s, 2, 3, 4)
	fmt.Printf("append 2,3,4: %v (len=%d, cap=%d)\n", s, len(s), cap(s))

	// 別のスライスの全要素を追加 (sB...)
	sA := []int{100, 200}
	sB := []int{300, 400}
	sA = append(sA, sB...)
	fmt.Printf("sA + sB...: %v (len=%d, cap=%d)\n", sA, len(sA), cap(sA))
}

```

## 解説
```text
スライスの強力な特徴は**可変長**性です。
組み込み関数 **`append`** で末尾に要素を追加できます。

**構文:**
`新しいスライス := append(元のスライス, 追加要素1, 追加要素2, ...)`

*   第1引数に元のスライス、第2引数以降に追加要素を
    **可変長引数**として渡します。
*   要素が追加された**新しいスライス**を返します。

**重要: 戻り値の再代入**
`append` は元のスライスを直接変更するとは限りません。
元のスライスの容量(capacity)が足りない場合、
**新しい内部配列を持つ新しいスライス**が返されます。
そのため、`append` の結果は**必ず元のスライス変数に
再代入**します (`slice = append(slice, ...)` )。

**容量の変化:**
容量が足りなくなると、`append` はより大きな容量を持つ
新しい内部配列を確保し、既存要素をコピーしてから
新しい要素を追加します。容量の増加量は実装依存ですが、
現在の容量の約2倍になることが多いです。
(例: cap=2 のスライスに要素を追加すると cap=4 になるなど)

**スライスの連結:**
別のスライス `sB` の全要素を `sA` に追加するには、
`sB` の後に `...` を付けて展開します。
`sA = append(sA, sB...)`

`append` はスライスを動的に扱うための基本関数です。
内部配列の再確保に備え、戻り値の再代入を忘れないようにしましょう。
パフォーマンスが重要な場合は `make` で初期容量を
適切に指定することも有効です。