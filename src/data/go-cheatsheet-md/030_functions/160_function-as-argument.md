## タイトル
title: 関数を引数として渡す (高階関数)

## タグ
tags: ["functions", "func", "関数型", "引数", "高階関数", "コールバック"]

## コード
```go
package main

import "fmt"

// 関数型の定義
type IntTransformer func(int) int

// 高階関数の定義: スライスと IntTransformer 型の関数を受け取る
func mapInts(slice []int, transformer IntTransformer) []int {
	result := make([]int, len(slice))
	for i, value := range slice {
		result[i] = transformer(value) // 引数で渡された関数を実行
	}
	return result
}

// 適用する具体的な関数
func double(n int) int {
	return n * 2
}

func main() {
	numbers := []int{1, 2, 3, 4}

	// 1. 通常の関数名を渡す
	doubled := mapInts(numbers, double)
	fmt.Println("2倍:", doubled) // [2 4 6 8]

	// 2. 関数リテラル (無名関数) を直接渡す
	negated := mapInts(numbers, func(n int) int {
		return -n
	})
	fmt.Println("符号反転:", negated) // [-1 -2 -3 -4]
}

```

## 解説
```text
Goでは関数が第一級オブジェクトのため、関数を
**他の関数の引数として渡す**ことができます。
関数を引数に取ったり戻り値で返す関数を
**高階関数 (Higher-Order Function)** と呼びます。

**関数を引数に取る関数の定義:**
引数リストで**関数型**を指定します。
`type` で定義した関数型名を使うと読みやすくなります。
```go
// type で定義した関数型名を使用
type MyFuncType func(int) string
func higherOrder(f MyFuncType, value int) string {
    return f(value) // 引数で受け取った関数 f を実行
}
```

コード例の `mapInts` 関数は、`[]int` と
`IntTransformer` 型 ( `func(int) int` ) の関数 `transformer` を
引数に取ります。ループ内で `transformer(value)` として
渡された関数を実行し、その結果を新しいスライスに格納して返します。

**呼び出し方:**
`main` 関数では `mapInts` を呼び出す際に、
1. 事前に定義された関数名 (`double`)
2. その場で定義した関数リテラル (`func(n int) int { return -n }`)
を渡しています。どちらも `IntTransformer` 型の
シグネチャに合致するため可能です。

**利点と応用:**
*   **処理のカスタマイズ:** `mapInts` のように基本処理は共通化し、
    具体的な処理内容 (`double` や符号反転) を呼び出し側で変えられる。
    (例: `filterStrings` 関数でフィルタ条件を渡すなど)
*   **コールバック:** イベント発生時などに実行される関数を登録する。
*   **ストラテジーパターン:** アルゴリズムの一部を交換可能にする。

関数を引数として渡す機能は、Goの柔軟性を高める基礎となります。