---
title: "関数: 関数を引数として渡す (高階関数)"
tags: ["functions", "func", "関数型", "引数", "高階関数", "コールバック"]
---

Go言語では関数が第一級オブジェクトであるため、関数を**他の関数の引数として渡す**ことができます。関数を引数として受け取ったり、関数を戻り値として返したりする関数のことを**高階関数 (Higher-Order Function)** と呼びます。

関数を引数として渡す機能は、処理の一部をカスタマイズ可能にしたり、特定のタイミングで実行される処理（コールバック）を登録したりする際に非常に役立ちます。

## 関数を引数として受け取る関数の定義

関数を引数として受け取るには、引数リストで**関数型**を指定します。`type` で定義した関数型名を使うと、コードがより読みやすくなります。

**構文:**
```go
// 関数型を直接指定
func 高階関数名(..., 引数名 func(引数リスト) 戻り値リスト, ...) { ... }

// type で定義した関数型名を使用
type MyFuncType func(引数リスト) 戻り値リスト
func 高階関数名(..., 引数名 MyFuncType, ...) { ... }
```

## コード例: 配列/スライスの各要素に関数を適用する

例として、整数のスライスと、各要素に適用する処理（関数）を受け取り、処理後の結果を新しいスライスとして返す高階関数 `mapInts` を作ってみましょう。

```go title="関数を引数として渡す例"
package main

import (
	"fmt"
	"strings"
)

// --- 関数型の定義 ---
// int を受け取り int を返す関数型
type IntTransformer func(int) int
// string を受け取り bool を返す関数型 (例: フィルタリング用)
type StringPredicate func(string) bool

// --- 高階関数の定義 ---

// 整数のスライスと IntTransformer 型の関数を受け取り、
// 各要素に関数を適用した結果のスライスを返す
func mapInts(slice []int, transformer IntTransformer) []int {
	result := make([]int, len(slice)) // 元のスライスと同じ長さの新しいスライスを作成
	for i, value := range slice {
		result[i] = transformer(value) // 各要素に関数を適用
	}
	return result
}

// 文字列のスライスと StringPredicate 型の関数を受け取り、
// 関数が true を返した要素だけを含む新しいスライスを返す (フィルタリング)
func filterStrings(slice []string, predicate StringPredicate) []string {
	var result []string // 空のスライスで初期化
	for _, value := range slice {
		if predicate(value) { // 条件を満たすかチェック
			result = append(result, value) // 条件を満たせば結果に追加
		}
	}
	return result
}

// --- 適用する具体的な関数 ---
func double(n int) int {
	return n * 2
}

func square(n int) int {
	return n * n
}

func hasPrefixA(s string) bool {
	return strings.HasPrefix(s, "A")
}

func main() {
	numbers := []int{1, 2, 3, 4, 5}
	fmt.Println("元の数値スライス:", numbers)

	// --- mapInts の呼び出し ---
	// 1. 通常の関数名を渡す
	doubled := mapInts(numbers, double)
	fmt.Println("2倍した結果:", doubled) // [2 4 6 8 10]

	squared := mapInts(numbers, square)
	fmt.Println("2乗した結果:", squared) // [1 4 9 16 25]

	// 2. 関数リテラル (無名関数) を直接渡す
	negated := mapInts(numbers, func(n int) int {
		return -n
	})
	fmt.Println("符号反転した結果:", negated) // [-1 -2 -3 -4 -5]

	fmt.Println()

	names := []string{"Alice", "Bob", "Anna", "Charlie", "Alex"}
	fmt.Println("元の名前スライス:", names)

	// --- filterStrings の呼び出し ---
	// 1. 通常の関数名を渡す
	aNames := filterStrings(names, hasPrefixA)
	fmt.Println("Aで始まる名前:", aNames) // [Alice Anna Alex]

	// 2. 関数リテラルを直接渡す
	shortNames := filterStrings(names, func(s string) bool {
		return len(s) <= 3 // 長さが3以下の名前
	})
	fmt.Println("短い名前:", shortNames) // [Bob]
}

/* 実行結果:
元の数値スライス: [1 2 3 4 5]
2倍した結果: [2 4 6 8 10]
2乗した結果: [1 4 9 16 25]
符号反転した結果: [-1 -2 -3 -4 -5]

元の名前スライス: [Alice Bob Anna Charlie Alex]
Aで始まる名前: [Alice Anna Alex]
短い名前: [Bob]
*/
```

**コード解説:**

*   `IntTransformer` と `StringPredicate` という関数型を定義しています。
*   `mapInts` 関数は、`IntTransformer` 型の関数 `transformer` を引数として受け取ります。ループ内で `transformer(value)` のようにして、渡された関数を実行しています。
*   `filterStrings` 関数は、`StringPredicate` 型の関数 `predicate` を引数として受け取ります。ループ内で `if predicate(value)` のようにして、渡された関数を実行し、その戻り値 (`bool`) を条件判断に使っています。
*   `main` 関数では、`mapInts` や `filterStrings` を呼び出す際に、
    *   事前に定義された関数名 (`double`, `square`, `hasPrefixA`) を渡したり、
    *   その場で関数リテラル (`func(n int) int { return -n }` や `func(s string) bool { return len(s) <= 3 }`) を定義して渡したりしています。

## 利点と応用

関数を引数として渡せることで、以下のような利点があります。

*   **処理のカスタマイズ:** `mapInts` や `filterStrings` のように、基本的な骨組み（ループ処理）は共通化しつつ、具体的な処理内容（各要素をどうするか、どの要素を選ぶか）を呼び出し側で自由に変更できます。
*   **コールバック:** 特定のイベントが発生したときや、非同期処理が完了したときに実行される関数（コールバック関数）を登録する際によく使われます。
*   **ストラテジーパターン:** アルゴリズムの一部を交換可能にするデザインパターンを実装する際に役立ちます。

関数を値として扱う機能は、Goの柔軟性を高め、より洗練されたコードを書くための基礎となります。