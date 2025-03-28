---
title: "制御構文: `for range` でインデックスや値を無視する"
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "ブランク識別子", "_"]
---

`for range` ループはコレクションの要素を反復処理するのに便利ですが、常にインデックス（またはキー）と値の両方が必要とは限りません。Goでは、不要な方の変数を受け取らない、または無視するための簡単な方法が用意されています。

## ブランク識別子 `_` を使って無視する

`for range` が返すペアのうち、片方の値が不要な場合は、**ブランク識別子 `_`** を使ってその値を受け取り、事実上無視することができます。これにより、未使用変数エラーを回避できます。

```go title="_ を使ってインデックスまたは値を無視する"
package main

import "fmt"

func main() {
	// スライスの例
	numbers := []int{10, 20, 30, 40}

	// 値だけが必要な場合 (インデックスを _ で無視)
	fmt.Println("--- 値のみ ---")
	sum := 0
	for _, value := range numbers {
		// fmt.Println(index) // エラー: index は定義されていない
		fmt.Printf("値: %d\n", value)
		sum += value
	}
	fmt.Printf("合計: %d\n", sum)

	// マップの例
	config := map[string]string{
		"host": "localhost",
		"port": "8080",
		"user": "admin",
	}

	// キーだけが必要な場合 (値を _ で無視)
	fmt.Println("\n--- キーのみ (マップ) ---")
	for key, _ := range config {
		// fmt.Println(value) // エラー: value は定義されていない
		fmt.Printf("設定キー: %s\n", key)
	}

	// 値だけが必要な場合 (キーを _ で無視)
	fmt.Println("\n--- 値のみ (マップ) ---")
	for _, value := range config {
		// fmt.Println(key) // エラー: key は定義されていない
		fmt.Printf("設定値: %s\n", value)
	}
}

/* 実行結果 (マップの順序は不定):
--- 値のみ ---
値: 10
値: 20
値: 30
値: 40
合計: 100

--- キーのみ (マップ) ---
設定キー: host
設定キー: port
設定キー: user

--- 値のみ (マップ) ---
設定値: localhost
設定値: 8080
設定値: admin
*/
```

## 値の変数を省略してインデックス/キーのみ取得

`for range` で**インデックス（またはマップのキー）だけが必要**な場合は、値を受け取る変数を完全に省略することができます。

```go title="値の変数を省略してインデックス/キーのみ取得"
package main

import "fmt"

func main() {
	// スライスの例
	colors := []string{"Red", "Green", "Blue"}

	fmt.Println("--- インデックスのみ (スライス) ---")
	// 値の変数を省略すると、インデックスのみが返される
	for index := range colors {
		fmt.Printf("インデックス: %d\n", index)
		// fmt.Println(value) // エラー: value は定義されていない
	}

	// マップの例
	permissions := map[string]bool{
		"read":  true,
		"write": true,
		"exec":  false,
	}

	fmt.Println("\n--- キーのみ (マップ) ---")
	// 値の変数を省略すると、キーのみが返される
	for key := range permissions {
		fmt.Printf("権限キー: %s\n", key)
		// fmt.Println(value) // エラー: value は定義されていない
	}
}

/* 実行結果 (マップの順序は不定):
--- インデックスのみ (スライス) ---
インデックス: 0
インデックス: 1
インデックス: 2

--- キーのみ (マップ) ---
権限キー: read
権限キー: write
権限キー: exec
*/
```

**注意:** 値だけが必要でインデックス/キーが不要な場合に、`for value := range collection` のように書くことはできません。値だけが必要な場合は、必ず `for _, value := range collection` のようにブランク識別子 `_` を使う必要があります。

これらの方法を使い分けることで、`for range` ループをより目的に合わせて簡潔に記述することができます。