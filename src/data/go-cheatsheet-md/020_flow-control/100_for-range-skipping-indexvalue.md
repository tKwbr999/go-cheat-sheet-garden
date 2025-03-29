## タイトル
title: 制御構文: `for range` でインデックスや値を無視する

## タグ
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "ブランク識別子", "_"]

## コード
```go
package main

import "fmt"

func main() {
	// スライスの例
	numbers := []int{10, 20, 30, 40}

	fmt.Println("--- 値のみ (スライス) ---")
	sum := 0
	for _, value := range numbers { // インデックスを _ で無視
		fmt.Printf("値: %d\n", value)
		sum += value
	}
	fmt.Printf("合計: %d\n", sum)

	// マップの例
	config := map[string]string{
		"host": "localhost", "port": "8080", "user": "admin",
	}

	fmt.Println("\n--- キーのみ (マップ) ---")
	for key, _ := range config { // 値を _ で無視
		fmt.Printf("設定キー: %s\n", key)
	}

	fmt.Println("\n--- 値のみ (マップ) ---")
	for _, value := range config { // キーを _ で無視
		fmt.Printf("設定値: %s\n", value)
	}
}
```

## 解説
```text
`for range` ループでは、インデックス/キーと値の
両方が不要な場合があります。Goでは不要な変数を
無視するための簡単な方法があります。

**ブランク識別子 `_` で無視:**
`for range` が返すペアのうち片方が不要な場合、
**ブランク識別子 `_`** で受け取り、無視します。
これにより未使用変数エラーを回避できます。

*   **値だけが必要な場合:**
    `for _, value := range collection { ... }`
    (コード例のスライス、マップの値のみのパターン)
*   **インデックス/キーだけが必要な場合:**
    `for key, _ := range collection { ... }`
    (コード例のマップのキーのみのパターン)

**値変数を省略してインデックス/キーのみ取得:**
インデックス（またはマップのキー）だけが必要な場合は、
値を受け取る変数を完全に省略できます。
*   スライス/配列: `for index := range collection { ... }`
*   マップ: `for key := range collection { ... }`

**注意:**
値だけが必要でインデックス/キーが不要な場合に、
`for value := range collection` のようには書けません。
必ず `for _, value := range collection` のように
ブランク識別子 `_` を使う必要があります。

これらを使い分け、`for range` を目的に合わせて
簡潔に記述しましょう。