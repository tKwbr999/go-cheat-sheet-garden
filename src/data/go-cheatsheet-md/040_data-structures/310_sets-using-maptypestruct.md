---
title: "データ構造: マップを使ったセットの実装 (map[T]struct{})"
tags: ["data-structures", "マップ", "map", "セット", "set", "集合", "struct{}", "空の構造体", "メモリ効率"]
---

前のセクションでは `map[T]bool` を使ってセットを実装する方法を見ました。Goコミュニティでは、もう一つ、より**メモリ効率が良い**とされる方法として、値の型に**空の構造体 `struct{}`** を使う `map[T]struct{}` というイディオムもよく使われます。

## `map[T]struct{}` によるセットの実装

この方法では、マップのキーにセットの要素を格納し、値としては**空の構造体 `struct{}`** を使います。

*   **空の構造体 `struct{}`:** フィールドを一切持たない構造体です。Goでは、空の構造体はメモリを**消費しません**（サイズがゼロです）。
*   **仕組み:** セットの本質は「要素が存在するかどうか」であり、マップの値自体には意味がありません。`map[T]bool` では値として `true` を格納していましたが、この `bool` 値もわずかながらメモリを消費します。`map[T]struct{}` では、メモリを消費しない空の構造体を値として使うことで、そのわずかなメモリ消費すらなくそうという考え方です。
*   **操作:** 要素の追加、存在確認、削除、反復処理の方法は `map[T]bool` の場合とほとんど同じです。追加時には値として `struct{}{}` （空の構造体のリテラル）を設定します。

## コード例

```go title="map[int]struct{} を使った整数セット"
package main

import "fmt"

func main() {
	// 整数を格納するセットを作成 (map[int]struct{} を使用)
	// make で初期化する
	numberSet := make(map[int]struct{})

	// --- 要素の追加 ---
	// キーに要素を、値に空の構造体リテラル struct{}{} を設定
	numberSet[1] = struct{}{}
	numberSet[3] = struct{}{}
	numberSet[5] = struct{}{}
	numberSet[1] = struct{}{} // 重複は無視される

	fmt.Printf("現在のセット: %v\n", numberSet) // 値は {} と表示される
	fmt.Printf("要素数 (len): %d\n", len(numberSet))

	// --- 要素の存在確認 ---
	elementToCheck := 3
	// カンマOKイディオムでキーの存在を確認 (値は無視して良い)
	_, exists := numberSet[elementToCheck]
	if exists {
		fmt.Printf("'%d' はセットに含まれています。\n", elementToCheck)
	} else {
		fmt.Printf("'%d' はセットに含まれていません。\n", elementToCheck)
	}

	elementToCheck = 4
	_, exists = numberSet[elementToCheck]
	if exists {
		fmt.Printf("'%d' はセットに含まれています。\n", elementToCheck)
	} else {
		fmt.Printf("'%d' はセットに含まれていません。\n", elementToCheck)
	}

	// --- 要素の削除 ---
	elementToDelete := 5
	fmt.Printf("\n'%d' を削除します...\n", elementToDelete)
	delete(numberSet, elementToDelete)

	// 削除後の存在確認
	_, exists = numberSet[elementToDelete]
	if !exists {
		fmt.Printf("'%d' は削除されました。\n", elementToDelete)
	}
	fmt.Printf("削除後のセット: %v\n", numberSet)
	fmt.Printf("削除後の要素数: %d\n", len(numberSet))

	// --- セットの反復処理 ---
	// マップなので for range でキー (セットの要素) を取得できる (順序不定)
	fmt.Println("\nセットの要素:")
	for element := range numberSet { // 値 (struct{}) は不要なので省略
		fmt.Printf("- %d\n", element)
	}
}

/* 実行結果 (マップの表示順序は不定):
現在のセット: map[1:{} 3:{} 5:{}]
要素数 (len): 3
'3' はセットに含まれています。
'4' はセットに含まれていません。

'5' を削除します...
'5' は削除されました。
削除後のセット: map[1:{} 3:{}]
削除後の要素数: 2

セットの要素:
- 1
- 3
*/
```

**コード解説:**

*   `numberSet := make(map[int]struct{})`: `int` を要素とするセットを `map[int]struct{}` で作成します。
*   `numberSet[1] = struct{}{}`: 要素 `1` をセットに追加します。値として空の構造体リテラル `struct{}{}` を使います。
*   存在確認 (`_, exists := numberSet[elementToCheck]`)、削除 (`delete(numberSet, elementToDelete)`)、反復処理 (`for element := range numberSet`) の方法は `map[T]bool` の場合と同じです。値 (`struct{}`) は通常使いません。

## `map[T]bool` vs `map[T]struct{}`

*   **メモリ効率:** `map[T]struct{}` の方が、値がメモリを消費しないため、わずかにメモリ効率が良いとされています。特に要素数が非常に多い場合に差が出る可能性があります。
*   **可読性/意図:** `map[T]bool` は、値が `true` であることが「セットに含まれている」ことを直感的に示していると考える人もいます。一方、`map[T]struct{}` は「値には意味がなく、キーの存在だけが重要」という意図をより明確に示しているとも言えます。

どちらの方法もGoコミュニティで広く使われています。パフォーマンスが極めて重要な場合や、メモリ使用量を最小限に抑えたい場合は `map[T]struct{}` が好まれる傾向がありますが、可読性を重視して `map[T]bool` を使うことも一般的です。プロジェクトやチームの規約に従うのが良いでしょう。