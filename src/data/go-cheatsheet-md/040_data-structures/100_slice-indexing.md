---
title: "データ構造: スライス (Slice) の要素へのアクセス"
tags: ["data-structures", "スライス", "slice", "インデックス", "アクセス", "代入", "範囲外アクセス", "panic"]
---

スライスを作成した後、配列と同様に、**インデックス (Index)** を使って個々の要素にアクセスしたり、値を変更したりすることができます。

## インデックスによるアクセス: `スライス名[インデックス]`

*   スライスの要素にも、`0` から始まる**インデックス**（番号）が割り当てられています。最初の要素のインデックスは `0`、2番目は `1`、...、最後の要素のインデックスは `len(スライス) - 1` です。
*   特定の要素にアクセスするには、`スライス名[インデックス]` という構文を使います。
*   この構文を使って、要素の値を**読み取る**ことも、新しい値を**書き込む（代入する）**こともできます。

```go title="スライス要素へのアクセスと代入"
package main

import "fmt"

func main() {
	// スライスリテラルでスライスを作成・初期化
	fruits := []string{"Apple", "Banana", "Cherry"} // len=3, cap=3
	fmt.Printf("初期状態: %q (len=%d, cap=%d)\n", fruits, len(fruits), cap(fruits))

	// --- 要素の読み取り ---
	firstFruit := fruits[0] // インデックス 0 ("Apple")
	secondFruit := fruits[1] // インデックス 1 ("Banana")
	// lastFruit := fruits[len(fruits)-1] // 最後の要素 ("Cherry")

	fmt.Printf("最初の果物: %s\n", firstFruit)
	fmt.Printf("2番目の果物: %s\n", secondFruit)
	fmt.Printf("インデックス 2 の果物: %s\n", fruits[2])

	// --- 要素への書き込み (代入) ---
	// スライスは可変なので、要素の値を変更できる
	fruits[1] = "Blueberry" // インデックス 1 の要素を "Blueberry" に変更
	fmt.Printf("変更後: %q\n", fruits)

	// --- ループを使ったアクセス ---
	fmt.Println("--- ループによるアクセス ---")
	for i := 0; i < len(fruits); i++ {
		fmt.Printf("インデックス %d: 値 %s\n", i, fruits[i])
	}

	// for range を使うことももちろん可能
	fmt.Println("--- for range によるアクセス ---")
	for index, value := range fruits {
		fmt.Printf("インデックス %d: 値 %s\n", index, value)
	}
}

/* 実行結果:
初期状態: ["Apple" "Banana" "Cherry"] (len=3, cap=3)
最初の果物: Apple
2番目の果物: Banana
インデックス 2 の果物: Cherry
変更後: ["Apple" "Blueberry" "Cherry"]
--- ループによるアクセス ---
インデックス 0: 値 Apple
インデックス 1: 値 Blueberry
インデックス 2: 値 Cherry
--- for range によるアクセス ---
インデックス 0: 値 Apple
インデックス 1: 値 Blueberry
インデックス 2: 値 Cherry
*/
```

## 範囲外アクセス (Index Out of Range)

配列と同様に、スライスのインデックスも `0` から `長さ (len) - 1` までです。この範囲外のインデックスを使って要素にアクセスしようとすると、プログラム実行時に**パニック (panic)** が発生します。

```go title="スライスの範囲外アクセス (panic)"
package main

import "fmt"

func main() {
	numbers := []int{10, 20} // 長さ 2 のスライス (インデックスは 0, 1)

	fmt.Println(numbers[0]) // OK
	fmt.Println(numbers[1]) // OK

	// 存在しないインデックス 2 にアクセスしようとする
	fmt.Println("範囲外アクセスを試みます...")
	// 以下の行を実行すると panic が発生する
	// fmt.Println(numbers[2])
	// panic: runtime error: index out of range [2] with length 2

	// 長さが 0 のスライスの場合、インデックス 0 も範囲外
	emptySlice := []int{}
	// fmt.Println(emptySlice[0]) // panic: runtime error: index out of range [0] with length 0
}
```

**注意:** スライス操作 `s[low:high]` の `high` はスライスの**長さ (len)** まで指定できますが、要素アクセス `s[index]` の `index` は**長さ (len) - 1** までしか指定できません。

スライスの要素へのアクセスは配列と同じように行えますが、スライスの長さは可変であるため、アクセスする前にインデックスが有効な範囲内にあるか、より注意を払う必要があります。