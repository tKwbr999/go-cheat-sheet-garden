## タイトル
title: データ構造: スライス (Slice) の要素へのアクセス

## タグ
tags: ["data-structures", "スライス", "slice", "インデックス", "アクセス", "代入", "範囲外アクセス", "panic"]

## コード
```go
package main

import "fmt"

func main() {
	fruits := []string{"Apple", "Banana", "Cherry"}
	fmt.Printf("初期状態: %q (len=%d)\n", fruits, len(fruits))

	// 要素の読み取り
	first := fruits[0]
	second := fruits[1]
	fmt.Printf("最初:%s, 2番目:%s, Index2:%s\n", first, second, fruits[2])

	// 要素への書き込み (代入)
	fruits[1] = "Blueberry" // スライスは変更可能
	fmt.Printf("変更後: %q\n", fruits)

	// ループを使ったアクセス (for i)
	fmt.Println("--- for i ---")
	for i := 0; i < len(fruits); i++ {
		fmt.Printf(" %d: %s\n", i, fruits[i])
	}

	// ループを使ったアクセス (for range)
	fmt.Println("--- for range ---")
	for index, value := range fruits {
		fmt.Printf(" %d: %s\n", index, value)
	}

	// 範囲外アクセスは panic
	// fmt.Println(fruits[3]) // panic: runtime error: index out of range
}

```

## 解説
```text
スライスの要素へのアクセスや変更は、配列と同様に
**インデックス (Index)** を使います。

**インデックスによるアクセス: `スライス名[インデックス]`**
*   インデックスは `0` から `長さ (len) - 1` まで。
*   `スライス名[インデックス]` で特定の要素にアクセス。
*   要素の値の**読み取り**も、新しい値の**書き込み（代入）**も可能。
    (スライス自体は可変)

コード例では `fruits[0]` で最初の要素 "Apple" を読み取り、
`fruits[1] = "Blueberry"` で2番目の要素を上書きしています。
`for i` ループや `for range` ループで全要素にアクセスできます。

**範囲外アクセス (Index Out of Range)**
配列と同様、スライスのインデックス範囲
(`0` 〜 `len(スライス) - 1`) を超えるインデックスで
アクセスしようとすると、実行時に **`panic`** が発生します。
長さが 0 のスライスでは、インデックス 0 も範囲外です。

スライスの長さは可変なので、アクセス前にインデックスが
有効範囲内にあるか、より注意が必要です。