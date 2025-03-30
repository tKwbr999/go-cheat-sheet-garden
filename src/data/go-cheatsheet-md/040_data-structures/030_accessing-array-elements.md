## タイトル
title: 配列 (Array) の要素へのアクセス

## タグ
tags: ["data-structures", "配列", "array", "インデックス", "アクセス", "代入", "範囲外アクセス", "panic"]

## コード
```go
package main

import "fmt"

func main() {
	var numbers [5]int // ゼロ値 [0 0 0 0 0]
	fmt.Printf("初期状態: %v\n", numbers)

	// 要素への書き込み (代入)
	numbers[0] = 10
	numbers[1] = 20
	numbers[4] = 50
	fmt.Printf("代入後:   %v\n", numbers)

	// 要素の読み取り
	first := numbers[0]
	last := numbers[4]
	fmt.Printf("最初:%d, 最後:%d, インデックス2:%d\n", first, last, numbers[2])

	// ループを使ったアクセス
	fmt.Println("--- ループ ---")
	for i := 0; i < len(numbers); i++ {
		fmt.Printf(" %d: %d\n", i, numbers[i])
		// numbers[i] = numbers[i] * 2 // 値の変更も可能
	}

	// 範囲外アクセスは panic を引き起こす
	// fmt.Println(numbers[5]) // panic: runtime error: index out of range
}

```

## 解説
```text
配列の要素にアクセスしたり、値を変更したりするには
**インデックス (Index)** を使います。

**インデックスによるアクセス: `配列名[インデックス]`**
*   インデックスは `0` から始まる整数です
    (最初の要素が `0`, 最後は `長さ - 1`)。
*   `配列名[インデックス]` で特定の要素にアクセスします。
*   この構文で、要素の値の**読み取り**も、
    新しい値の**書き込み（代入）**も可能です。

コード例では、`numbers` 配列を宣言後、
`numbers[0] = 10` のようにインデックスを指定して
値を代入しています。
`first := numbers[0]` のように値を読み取って
変数に代入したり、`numbers[0] + numbers[1]` のように
計算に使ったりできます。
`for` ループと `len()` を使えば、配列の全要素に
順番にアクセスできます。

**範囲外アクセス (Index Out of Range)**
配列のインデックスは `0` から `長さ - 1` までです。
この範囲外のインデックス (例: `numbers[5]` や `numbers[-1]`) を
使ってアクセスしようとすると、プログラム実行時に
**パニック (`panic`)** が発生し、異常終了します。
ループなどでアクセスする際は、インデックスが
範囲内に収まるように注意が必要です。