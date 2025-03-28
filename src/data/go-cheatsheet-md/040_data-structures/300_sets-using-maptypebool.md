---
title: "データ構造: マップを使ったセット (Set) の実装 (map[T]bool)"
tags: ["data-structures", "マップ", "map", "セット", "set", "集合"]
---

**セット (Set)** は、数学における集合のように、**重複しない要素**の集まりを扱うデータ構造です。ある要素がセットに含まれているかどうかを効率的に確認したり、要素を追加・削除したりする操作が基本となります。

Go言語には、標準で組み込みのセット型は用意されていません。しかし、**マップ (map)** の特性を利用して、簡単にセットを実装することができます。

## `map[T]bool` によるセットの実装

最も一般的な方法は、キーの型をセットに格納したい要素の型 `T` とし、値の型を `bool` とするマップ `map[T]bool` を使うことです。

*   セットに要素を追加するには、その要素をキーとしてマップに追加し、値として `true` を設定します (`set[element] = true`)。
*   要素がセットに含まれているか確認するには、マップにその要素のキーが存在するかどうかをチェックします（カンマOKイディオム `_, ok := set[element]` を使います）。
*   要素を削除するには、マップからその要素のキーを削除します (`delete(set, element)`)。

値として `bool` の `true` を使うのは慣習的なもので、キーが存在すること自体が重要であり、値 (`true`) 自体にはあまり意味はありません。

```go title="map[string]bool を使った文字列セット"
package main

import "fmt"

func main() {
	// 文字列を格納するセットを作成 (map[string]bool を使用)
	// make で初期化する
	fruitSet := make(map[string]bool)

	// --- 要素の追加 ---
	// キーに要素を、値に true を設定して追加
	fruitSet["apple"] = true
	fruitSet["banana"] = true
	fruitSet["orange"] = true
	fruitSet["apple"] = true // 同じ要素を再度追加しても、マップなので上書きされるだけ (重複しない)

	fmt.Printf("現在のセット: %v\n", fruitSet) // マップなので順序は不定
	fmt.Printf("要素数 (len): %d\n", len(fruitSet))

	// --- 要素の存在確認 ---
	elementToCheck := "banana"
	// カンマOKイディオムでキーの存在を確認
	_, exists := fruitSet[elementToCheck]
	if exists {
		fmt.Printf("'%s' はセットに含まれています。\n", elementToCheck)
	} else {
		fmt.Printf("'%s' はセットに含まれていません。\n", elementToCheck)
	}

	elementToCheck = "grape"
	_, exists = fruitSet[elementToCheck]
	if exists {
		fmt.Printf("'%s' はセットに含まれています。\n", elementToCheck)
	} else {
		fmt.Printf("'%s' はセットに含まれていません。\n", elementToCheck)
	}

	// 注意: if fruitSet["grape"] { ... } のように直接 bool 値で判定すると、
	// キーが存在しない場合にゼロ値 false が返るため、意図しない結果になる可能性がある。
	// 必ずカンマOKイディオムで存在を確認する。

	// --- 要素の削除 ---
	elementToDelete := "orange"
	fmt.Printf("\n'%s' を削除します...\n", elementToDelete)
	delete(fruitSet, elementToDelete)

	// 削除後の存在確認
	_, exists = fruitSet[elementToDelete]
	if !exists {
		fmt.Printf("'%s' は削除されました。\n", elementToDelete)
	}
	fmt.Printf("削除後のセット: %v\n", fruitSet)
	fmt.Printf("削除後の要素数: %d\n", len(fruitSet))

	// --- セットの反復処理 ---
	// マップなので for range でキー (セットの要素) を取得できる (順序不定)
	fmt.Println("\nセットの要素:")
	for element := range fruitSet { // 値 (bool) は不要なので省略
		fmt.Printf("- %s\n", element)
	}
}

/* 実行結果 (マップの表示順序は不定):
現在のセット: map[apple:true banana:true orange:true]
要素数 (len): 3
'banana' はセットに含まれています。
'grape' はセットに含まれていません。

'orange' を削除します...
'orange' は削除されました。
削除後のセット: map[apple:true banana:true]
削除後の要素数: 2

セットの要素:
- apple
- banana
*/
```

**コード解説:**

*   `fruitSet := make(map[string]bool)`: 文字列を要素とするセットを `map[string]bool` で作成します。
*   `fruitSet["apple"] = true`: `"apple"` という要素をセットに追加します。
*   `_, exists := fruitSet[elementToCheck]`: カンマOKイディオムを使って、`elementToCheck` がキーとして存在するかどうかを確認します。`exists` が `true` ならセットに含まれています。
*   `delete(fruitSet, elementToDelete)`: セットから `"orange"` という要素（キー）を削除します。
*   `for element := range fruitSet`: `for range` を使ってセットの全要素（マップのキー）を反復処理します。値 (`true`) は通常使わないので、値の変数自体を省略しています。

`map[T]bool` を使う方法は、Goでセットを表現するためのシンプルで一般的な方法です。次のセクションでは、値として空の構造体 `struct{}` を使う、もう一つの実装方法を見ていきます。