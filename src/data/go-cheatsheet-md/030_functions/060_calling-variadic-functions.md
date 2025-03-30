## タイトル
title: 可変長引数関数の呼び出し

## タグ
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス"]

## コード
```go
package main

import "fmt"

// 可変長引数関数 (再掲)
func sum(nums ...int) int {
	fmt.Printf("渡された引数 (スライスとして): %v\n", nums)
	total := 0
	for _, num := range nums {
		total += num
	}
	return total
}

func main() {
	myNumbers := []int{5, 10, 15}
	moreNumbers := []int{1, 2}
	emptySlice := []int{}

	// スライスを展開して渡す: スライス名...
	total1 := sum(myNumbers...) // 5, 10, 15 が渡される
	fmt.Printf("合計1: %d\n\n", total1)

	total2 := sum(moreNumbers...) // 1, 2 が渡される
	fmt.Printf("合計2: %d\n\n", total2)

	total3 := sum(emptySlice...) // 空のスライス -> 引数0個
	fmt.Printf("合計3: %d\n\n", total3)

	// sum(1, myNumbers...) // これはコンパイルエラー
}

```

## 解説
```text
可変長引数を持つ関数 (`func f(args ...T)`) を
呼び出す方法は主に2つあります。

**1. 個別の引数を渡す**
通常の関数のように、カンマ `,` で区切って
値を直接渡します。0個以上の任意の個数を渡せます。
```go
sum(1, 2, 3) // -> 6
sum(10)      // -> 10
sum()        // -> 0
```

**2. スライスを展開して渡す: `スライス名...`**
既に値がスライスに格納されている場合、
スライス変数の後に `...` を付けて呼び出すと、
スライスの各要素が個別の引数として展開されて
関数に渡されます。

コード例では `sum(myNumbers...)` が
`sum(5, 10, 15)` として呼び出されます。

**注意点:**
*   渡すスライスの要素型は、可変長引数の型と
    一致する必要があります (例: `[]int` を `...int` へ)。
*   通常の引数とスライス展開 (`...`) を混ぜて
    可変長引数部分に渡すことはできません
    (例: `sum(1, myNumbers...)` はエラー)。
    (ただし、関数定義に固定引数があれば、
    固定引数 + スライス展開 は可能です)。

これらの呼び出し方を理解し、可変長引数関数を
効果的に利用しましょう。