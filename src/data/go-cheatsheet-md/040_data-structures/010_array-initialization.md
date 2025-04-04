## タイトル
title: 配列 (Array) の初期化

## タグ
tags: ["data-structures", "配列", "array", "初期化", "リテラル"]

## コード
```go
package main

import "fmt"

func main() {
	// サイズ 3 の int 配列を初期化
	numbers := [3]int{10, 20, 30}
	fmt.Printf("numbers: %v (%T)\n", numbers, numbers)

	// サイズ 4 の string 配列を初期化
	fruits := [4]string{"Apple", "Banana", "Cherry", "Date"}
	fmt.Printf("fruits: %q (%T)\n", fruits, fruits)

	// 要素数がサイズと一致しないとコンパイルエラー
	// error1 := [3]int{1, 2} // エラー
	// error2 := [3]int{1, 2, 3, 4} // エラー
}

```

## 解説
```text
配列宣言時にゼロ値ではなく特定の値で初期化するには、
**配列リテラル**を使います。

**構文:**
`変数名 := [サイズ]要素の型{値1, 値2, ..., 値N}`
または
`var 変数名 = [サイズ]要素の型{値1, 値2, ..., 値N}`

*   `{}` 内に初期値をカンマ区切りで記述します。
*   値の数は宣言した配列の**サイズと一致**させる必要があります。
    (コード例のエラー参照)

**要素数を省略 (`...`)**
初期値を指定する場合、サイズ部分に `...` を書くと、
コンパイラが**初期値の数に基づいてサイズを決定**します。
`primes := [...]int{2, 3, 5}` // サイズは 3 になる

**インデックス指定**
リテラル内で `インデックス: 値` の形式で、
特定の要素だけを初期化できます。
指定されなかった要素はゼロ値になります。
`arr := [5]int{1: 10, 3: 30}` // -> [0 10 0 30 0]

`[...]` とインデックス指定も組み合わせ可能です。
`arr := [...]int{0: 1, 4: 5}` // サイズは 5 になる

配列リテラルで宣言と初期化を同時に行え、便利です。