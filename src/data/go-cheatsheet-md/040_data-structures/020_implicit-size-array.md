## タイトル
title: 配列 (Array) のサイズ推論 `...`

## タグ
tags: ["data-structures", "配列", "array", "初期化", "リテラル", "サイズ推論", "..."]

## コード
```go
package main

import "fmt"

func main() {
	// [...] で初期値の数からサイズを推論 (サイズ 4)
	numbers := [...]int{10, 20, 30, 40}
	fmt.Printf("numbers: %v (%T, len=%d)\n", numbers, numbers, len(numbers))

	// サイズ 3 の配列になる
	weekdays := [...]string{"Mon", "Tue", "Wed"}
	fmt.Printf("weekdays: %q (%T, len=%d)\n", weekdays, weekdays, len(weekdays))

	// サイズ 1 の配列
	single := [...]bool{true}
	fmt.Printf("single: %v (%T, len=%d)\n", single, single, len(single))

	// サイズ 0 の配列
	empty := [...]float64{}
	fmt.Printf("empty: %v (%T, len=%d)\n", empty, empty, len(empty))
}

```

## 解説
```text
配列リテラルで初期化する際、サイズ指定部分に `...` を使うと、
コンパイラが**初期値の数からサイズを自動推論**します。

**構文:** `変数名 := [...]要素の型{値1, 値2, ...}`

*   `[...]`: サイズの代わりに `...` を記述。
*   コンパイラが `{}` 内の初期値の個数を数え、
    それを配列サイズとして決定します。

コード例では、`numbers` は初期値4つなので `[4]int` 型、
`weekdays` は初期値3つなので `[3]string` 型になります。
要素が1つなら `[1]bool`、なくても `[0]float64` のように
サイズ0の配列になります。

**利点:**
*   要素数を数える手間が省ける。
*   リテラル内の要素を増減させた際に、サイズ指定 `[N]` を
    手動で修正する必要がない。

**インデックス指定初期化との組み合わせ:**
`[...]` はインデックス指定とも組み合わせられます。
`arr := [...]int{0: 1, 4: 5}`
この場合、サイズは**指定された最大のインデックス + 1**
(この例では 4 + 1 = 5) になります。

`[...]` で配列初期化をより柔軟かつ安全に行えますが、
生成されるのは**固定長の配列**である点に注意が必要です。
可変長が必要ならスライスを使います。