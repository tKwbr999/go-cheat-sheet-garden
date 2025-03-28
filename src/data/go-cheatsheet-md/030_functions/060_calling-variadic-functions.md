---
title: "関数: 可変長引数関数の呼び出し"
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス"]
---

前のセクションで定義した可変長引数を持つ関数 (`func f(args ...T)`) を呼び出すには、主に2つの方法があります。

## 1. 個別の引数を渡す

最も一般的な方法は、可変長引数として受け取りたい値を、通常の関数の引数のようにカンマ `,` で区切って直接渡す方法です。0個以上の任意の個数の引数を渡すことができます。

```go title="個別の引数を渡して呼び出す"
package main

import "fmt"

// 任意の個数の int を受け取り合計する関数 (再掲)
func sum(nums ...int) int {
	total := 0
	for _, num := range nums {
		total += num
	}
	return total
}

// 任意の個数の string を受け取り表示する関数 (再掲)
func printMessages(messages ...string) {
	fmt.Println("--- メッセージ ---")
	if len(messages) == 0 {
		fmt.Println("(なし)")
		return
	}
	for _, msg := range messages {
		fmt.Println("-", msg)
	}
}

func main() {
	// sum 関数を個別の引数で呼び出す
	fmt.Println(sum(1, 2))       // 引数 2つ -> nums は [1 2] になる
	fmt.Println(sum(10, 20, 30)) // 引数 3つ -> nums は [10 20 30] になる
	fmt.Println(sum())           // 引数 0個 -> nums は [] (空のスライス) になる

	fmt.Println()

	// printMessages 関数を個別の引数で呼び出す
	printMessages("Hello", "World")
	printMessages("Single message")
	printMessages()
}

/* 実行結果:
3
60
0

--- メッセージ ---
- Hello
- World
--- メッセージ ---
- Single message
--- メッセージ ---
(なし)
*/
```

## 2. スライスを展開して渡す: `スライス名...`

既に値がスライスに格納されている場合、そのスライスの要素を可変長引数として関数に渡したいことがあります。この場合、スライス変数の後に `...` を付けて関数を呼び出します。これにより、スライスの各要素が個別の引数として関数に展開されて渡されます。

**構文:** `関数名(固定引数..., スライス名...)`

```go title="スライスを展開して渡す"
package main

import "fmt"

// 任意の個数の int を受け取り合計する関数 (再掲)
func sum(nums ...int) int {
	fmt.Printf("sum に渡されたスライス: %v\n", nums)
	total := 0
	for _, num := range nums {
		total += num
	}
	return total
}

func main() {
	// int のスライスを作成
	myNumbers := []int{5, 10, 15, 20}
	moreNumbers := []int{1, 2}

	// スライス myNumbers を展開して sum 関数に渡す
	// myNumbers... は 5, 10, 15, 20 という個別の引数として渡される
	total1 := sum(myNumbers...)
	fmt.Printf("合計1: %d\n\n", total1)

	// 別のスライス moreNumbers を展開して渡す
	total2 := sum(moreNumbers...)
	fmt.Printf("合計2: %d\n\n", total2)

	// スライスが空の場合
	emptySlice := []int{}
	total3 := sum(emptySlice...)
	fmt.Printf("合計3: %d\n\n", total3)

	// 通常の引数とスライス展開を組み合わせることはできない
	// total4 := sum(1, myNumbers...) // コンパイルエラー
}

/* 実行結果:
sum に渡されたスライス: [5 10 15 20]
合計1: 50

sum に渡されたスライス: [1 2]
合計2: 3

sum に渡されたスライス: []
合計3: 0
*/
```

**ポイント:**

*   `sum(myNumbers...)` のように、スライス変数名の後に `...` を付けると、スライスの要素が展開されて可変長引数として渡されます。
*   渡すスライスの要素の型は、可変長引数として定義された型（この例では `int`）と一致している必要があります。
*   **注意:** 通常の引数とスライス展開 (`...`) を混ぜて可変長引数部分に渡すことはできません（例: `sum(1, myNumbers...)` はエラー）。ただし、関数定義で固定引数と可変長引数が両方ある場合は、固定引数を先に渡し、最後にスライス展開を渡すことは可能です（次のセクションで説明）。

これらの呼び出し方を理解することで、可変長引数を持つ関数を効果的に利用できます。