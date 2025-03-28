---
title: "データ構造: スライスリテラルによる作成と初期化"
tags: ["data-structures", "スライス", "slice", "初期化", "リテラル"]
---

`make` 関数を使う以外に、**スライスリテラル**を使ってスライスの作成と初期化を同時に行うこともできます。これは配列リテラルと非常によく似ていますが、サイズを指定しない点が異なります。

## スライスリテラルの構文

**構文:** `変数名 := []要素の型{値1, 値2, ...}`

*   `[]要素の型`: サイズを指定せずに `[]` と書くことで、これがスライスであることを示します。
*   `{値1, 値2, ...}`: 中括弧 `{}` の中に、スライスの要素となる初期値をカンマ `,` で区切って記述します。要素の数は任意（0個以上）です。

この構文は、内部的に以下の2つのステップを実行します。

1.  リテラルで指定された値 `{値1, 値2, ...}` をちょうど格納できるサイズの**配列**を（内部的に）作成します。
2.  その作成された配列全体を参照する**スライス**を生成し、変数に代入します。

結果として、生成されるスライスの**長さ (Length)** と**容量 (Capacity)** は、どちらもリテラルで指定された**初期値の数**と同じになります。

```go title="スライスリテラルによる作成と初期化"
package main

import "fmt"

func main() {
	// int 型のスライスをリテラルで作成・初期化
	// 内部的にサイズ 5 の配列が作られ、それを参照するスライスが生成される
	numbers := []int{10, 20, 30, 40, 50}
	fmt.Printf("numbers: %v (len=%d, cap=%d, 型=%T)\n",
		numbers, len(numbers), cap(numbers), numbers) // len=5, cap=5

	// string 型のスライス
	names := []string{"Alice", "Bob", "Charlie"}
	fmt.Printf("names: %q (len=%d, cap=%d, 型=%T)\n",
		names, len(names), cap(names), names) // len=3, cap=3

	// bool 型のスライス
	flags := []bool{true, false, true}
	fmt.Printf("flags: %v (len=%d, cap=%d, 型=%T)\n",
		flags, len(flags), cap(flags), flags) // len=3, cap=3

	// 空のスライスリテラル (nil ではないが、長さも容量も 0)
	emptySlice := []float64{}
	fmt.Printf("emptySlice: %v (len=%d, cap=%d, 型=%T)\n",
		emptySlice, len(emptySlice), cap(emptySlice), emptySlice) // len=0, cap=0
	if emptySlice == nil {
		fmt.Println("emptySlice は nil です")
	} else {
		fmt.Println("emptySlice は nil ではありません (空のスライスです)")
	}
}

/* 実行結果:
numbers: [10 20 30 40 50] (len=5, cap=5, 型=[]int)
names: ["Alice" "Bob" "Charlie"] (len=3, cap=3, 型=[]string)
flags: [true false true] (len=3, cap=3, 型=[]bool)
emptySlice: [] (len=0, cap=0, 型=[]float64)
emptySlice は nil ではありません (空のスライスです)
*/
```

## インデックス指定初期化

配列リテラルと同様に、スライスリテラルでも `インデックス: 値` の形式で特定のインデックスを指定して初期化できます。この場合も、最大のインデックスに基づいて内部配列のサイズが決まり、スライスの長さと容量はそのサイズと同じになります。指定されなかった要素はゼロ値で初期化されます。

```go title="インデックス指定によるスライスリテラル初期化"
package main

import "fmt"

func main() {
	// インデックス 1 と 3 を指定して初期化
	// 最大インデックスが 3 なので、内部配列のサイズは 4 になる
	// スライスの長さも容量も 4 になる
	sparseSlice := []int{1: 100, 3: 300}
	fmt.Printf("sparseSlice: %v (len=%d, cap=%d, 型=%T)\n",
		sparseSlice, len(sparseSlice), cap(sparseSlice), sparseSlice)
}

/* 実行結果:
sparseSlice: [0 100 0 300] (len=4, cap=4, 型=[]int)
*/
```

スライスリテラルは、初期値を持つスライスを簡潔に作成するための便利な方法です。`make` とスライスリテラルのどちらを使うかは、初期値が必要かどうかや、初期容量を明示的に指定したいかどうかによって選択します。