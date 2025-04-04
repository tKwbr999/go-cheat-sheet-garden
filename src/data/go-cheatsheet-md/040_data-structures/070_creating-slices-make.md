## タイトル
title: `make` 関数によるスライス (Slice) の作成

## タグ
tags: ["data-structures", "スライス", "slice", "make", "長さ", "容量", "ゼロ値"]

## コード
```go
package main

import "fmt"

func main() {
	// 長さのみ指定: make([]要素型, 長さ)
	// 長さ 5、容量 5 の int スライス (要素は 0)
	s1 := make([]int, 5)
	fmt.Printf("s1: %v (len=%d, cap=%d)\n", s1, len(s1), cap(s1))
	s1[0] = 10 // アクセス・代入可能
	fmt.Printf("s1変更後: %v\n", s1)

	// 長さと容量を指定: make([]要素型, 長さ, 容量)
	// 長さ 3、容量 10 の string スライス (要素は "")
	s2 := make([]string, 3, 10)
	fmt.Printf("s2: %q (len=%d, cap=%d)\n", s2, len(s2), cap(s2))
	s2[0] = "A"
	// s2[3] = "B" // エラー: 長さ(3)を超えるインデックスはアクセス不可

	// 長さ 0、容量 5 のスライス
	s3 := make([]int, 0, 5)
	fmt.Printf("s3: %v (len=%d, cap=%d)\n", s3, len(s3), cap(s3))
}

```

## 解説
```text
`var s []T` で宣言されたスライスは `nil` です。
要素を格納するには内部配列を確保し初期化する必要があり、
その主な方法が組み込み関数 **`make`** です。
(`make` はスライス、マップ、チャネルの初期化に使う)

**`make` によるスライス作成:**
1.  **長さのみ指定: `make([]T, len)`**
    *   指定された `len` を持つスライスを作成。
    *   容量 (`cap`) も `len` と同じになる。
    *   要素は型 `T` の**ゼロ値**で初期化される。
    *   `nil` ではないので、すぐにインデックスでアクセス可能。

2.  **長さと容量を指定: `make([]T, len, cap)`**
    *   指定された `len` と `cap` を持つスライスを作成
        (`cap >= len` である必要あり)。
    *   `cap` サイズの内部配列が確保される。
    *   最初の `len` 個の要素がゼロ値で初期化される。
    *   `len` を超えるインデックスには直接アクセスできないが、
        `append` で要素を追加する際に容量の範囲内で
        効率的に追加できる（内部配列の再確保が少ない）。

コード例の `s1` は長さ5、容量5で作成され、`s2` は長さ3、容量10で
作成されています。`s2[3]` へのアクセスはエラーになりますが、
`append(s2, "!")` は容量に空きがあるため効率的に行えます。

`make([]T, 0, cap)` で長さ0、容量`cap`のスライスを作ることもでき、
後で `append` する際の効率化に繋がります。