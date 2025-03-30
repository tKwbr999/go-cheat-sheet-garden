## タイトル
title: スライスリテラルによる作成と初期化

## タグ
tags: ["data-structures", "スライス", "slice", "初期化", "リテラル"]

## コード
```go
package main

import "fmt"

func main() {
	// int スライスリテラル
	numbers := []int{10, 20, 30, 40, 50}
	fmt.Printf("numbers: %v (len=%d, cap=%d)\n", numbers, len(numbers), cap(numbers))

	// string スライスリテラル
	names := []string{"Alice", "Bob", "Charlie"}
	fmt.Printf("names: %q (len=%d, cap=%d)\n", names, len(names), cap(names))

	// bool スライスリテラル
	flags := []bool{true, false, true}
	fmt.Printf("flags: %v (len=%d, cap=%d)\n", flags, len(flags), cap(flags))

	// 空のスライスリテラル (nil ではない)
	emptySlice := []float64{}
	fmt.Printf("emptySlice: %v (len=%d, cap=%d)\n", emptySlice, len(emptySlice), cap(emptySlice))
	if emptySlice != nil {
		fmt.Println("emptySlice は nil ではありません")
	}
}

```

## 解説
```text
`make` 以外に、**スライスリテラル**を使って
スライスの作成と初期化を同時に行えます。
配列リテラルと似ていますが、サイズを指定しません。

**構文:** `変数名 := []要素の型{値1, 値2, ...}`
*   `[]要素の型`: サイズを指定しない (`[]`)。
*   `{値1, ...}`: 初期値をカンマ区切りで記述 (0個以上)。

**内部動作:**
1. リテラルの値 `{...}` を格納できるサイズの配列を内部的に作成。
2. その配列全体を参照するスライスを生成し、変数に代入。

結果として、生成されるスライスの**長さ (len)** と
**容量 (cap)** は、どちらも**初期値の数**と同じになります。

コード例では `numbers` は長さ・容量5、`names` は長さ・容量3です。

**空スライスリテラル:** `[]型{}`
長さも容量も 0 のスライスを作成します。
これは `nil` スライスとは異なります (`!= nil`) が、
`append` などの動作は `nil` スライスと同様に使えます。

**インデックス指定初期化:**
配列と同様に `インデックス: 値` 形式も使えます。
`s := []int{1: 100, 3: 300}`
この場合、最大のインデックス (3) に基づいて
内部配列のサイズ (4) が決まり、スライスの長さ・容量も 4 になります
(`[0 100 0 300]`)。

**`make` vs リテラル:**
*   初期値が必要ならリテラルが便利。
*   初期容量を長さと別に指定したいなら `make`。
*   ゼロ値で初期化された特定の長さのスライスが必要なら `make`。