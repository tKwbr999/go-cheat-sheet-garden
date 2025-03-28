---
title: "データ構造: 配列 (Array) の要素へのアクセス"
tags: ["data-structures", "配列", "array", "インデックス", "アクセス", "代入", "範囲外アクセス", "panic"]
---

配列を宣言したり初期化したりした後、その中に格納されている個々の要素にアクセスしたり、値を変更したりする必要があります。Go言語では、**インデックス (Index)** を使って配列の要素にアクセスします。

## インデックスによるアクセス: `配列名[インデックス]`

*   配列の要素には、`0` から始まる**インデックス**（番号）が割り当てられています。最初の要素のインデックスは `0`、2番目は `1`、...、最後の要素のインデックスは `配列の長さ - 1` です。
*   特定の要素にアクセスするには、`配列名[インデックス]` という構文を使います。
*   この構文を使って、要素の値を**読み取る**ことも、新しい値を**書き込む（代入する）**こともできます。

```go title="配列要素へのアクセスと代入"
package main

import "fmt"

func main() {
	// サイズ 5 の int 配列を宣言 (ゼロ値 [0 0 0 0 0] で初期化)
	var numbers [5]int
	fmt.Printf("初期状態: %v\n", numbers)

	// --- 要素への書き込み (代入) ---
	numbers[0] = 10 // インデックス 0 (最初の要素) に 10 を代入
	numbers[1] = 20 // インデックス 1 (2番目の要素) に 20 を代入
	numbers[4] = 50 // インデックス 4 (最後の要素) に 50 を代入
	// numbers[2] と numbers[3] はゼロ値 0 のまま

	fmt.Printf("代入後:   %v\n", numbers)

	// --- 要素の読み取り ---
	firstElement := numbers[0] // インデックス 0 の値を読み取り、変数に代入
	secondElement := numbers[1]
	lastElement := numbers[4]

	fmt.Printf("最初の要素: %d\n", firstElement)
	fmt.Printf("2番目の要素: %d\n", secondElement)
	fmt.Printf("最後の要素: %d\n", lastElement)
	fmt.Printf("インデックス 2 の要素: %d\n", numbers[2]) // ゼロ値 0 が読み取られる

	// --- 読み取った値を使って計算 ---
	sumFirstTwo := numbers[0] + numbers[1]
	fmt.Printf("最初の2要素の合計: %d\n", sumFirstTwo)

	// --- ループを使ったアクセス ---
	fmt.Println("--- ループによるアクセス ---")
	// len(numbers) は配列の長さ (5) を返す
	for i := 0; i < len(numbers); i++ {
		fmt.Printf("インデックス %d: 値 %d\n", i, numbers[i])
		// ループ内で値を変更することも可能
		// numbers[i] = numbers[i] * 2
	}
}

/* 実行結果:
初期状態: [0 0 0 0 0]
代入後:   [10 20 0 0 50]
最初の要素: 10
2番目の要素: 20
最後の要素: 50
インデックス 2 の要素: 0
最初の2要素の合計: 30
--- ループによるアクセス ---
インデックス 0: 値 10
インデックス 1: 値 20
インデックス 2: 値 0
インデックス 3: 値 0
インデックス 4: 値 50
*/
```

## 範囲外アクセス (Index Out of Range)

配列のインデックスは `0` から `長さ - 1` までです。この範囲外のインデックスを使って要素にアクセスしようとすると、プログラム実行時に**パニック (panic)** が発生し、プログラムが異常終了します。

```go title="範囲外アクセスの例 (panic が発生)"
package main

import "fmt"

func main() {
	numbers := [3]int{1, 2, 3} // サイズ 3 の配列 (インデックスは 0, 1, 2)

	fmt.Println(numbers[0]) // OK
	fmt.Println(numbers[2]) // OK

	// 存在しないインデックス 3 にアクセスしようとする
	fmt.Println("範囲外アクセスを試みます...")
	// 以下の行を実行すると panic が発生する
	// fmt.Println(numbers[3])
	// panic: runtime error: index out of range [3] with length 3

	// 負のインデックスも範囲外
	// fmt.Println(numbers[-1]) // コンパイルエラーになる場合もあるが、実行時 panic の可能性もある
}

/* numbers[3] のコメントを外した場合の実行例:
1
3
範囲外アクセスを試みます...
panic: runtime error: index out of range [3] with length 3

goroutine 1 [running]:
main.main()
        /path/to/your/file.go:16 +0x??
exit status 2
*/
```

**注意:** 配列の範囲外アクセスはプログラムのクラッシュにつながるため、`for` ループなどで配列にアクセスする際は、インデックスが常に `0` 以上 `len(配列) - 1` 以下になるように注意する必要があります。

配列の要素へのアクセスは、格納されたデータを利用するための基本的な操作です。インデックスの範囲に注意して正しく使いましょう。