## タイトル
title: マップを使ったセット (Set) の実装 (map[T]bool)

## タグ
tags: ["data-structures", "マップ", "map", "セット", "set", "集合"]

## コード
```go
package main

import "fmt"

func main() {
	// セットを作成 (map[string]bool を使用)
	fruitSet := make(map[string]bool)

	// 要素の追加 (キーに要素、値に true)
	fruitSet["apple"] = true
	fruitSet["banana"] = true
	fruitSet["orange"] = true
	fruitSet["apple"] = true // 重複は無視される (上書き)
	fmt.Printf("追加後: %v (len=%d)\n", fruitSet, len(fruitSet))

	// 要素の存在確認 (カンマOKイディオム)
	key := "banana"
	_, exists := fruitSet[key]
	if exists { fmt.Printf("'%s' は存在する\n", key) }

	key = "grape"
	_, exists = fruitSet[key]
	if !exists { fmt.Printf("'%s' は存在しない\n", key) }

	// 要素の削除
	delete(fruitSet, "orange")
	fmt.Printf("削除後: %v (len=%d)\n", fruitSet, len(fruitSet))

	// セットの反復処理 (for range でキーを取得)
	// for element := range fruitSet { fmt.Println(element) }
}

```

## 解説
```text
**セット (Set)** は、**重複しない要素**の集まりを扱う
データ構造です。Goには組み込みセット型はありませんが、
**マップ (map)** を使って簡単に実装できます。

**`map[T]bool` による実装:**
キーの型 `T` をセット要素の型、値の型を `bool` とします。
`map[string]bool` なら文字列のセットになります。

**操作:**
*   **作成:** `s := make(map[T]bool)`
*   **追加:** `s[element] = true`
    (キーが存在すれば上書きされるだけなので重複しない)
*   **存在確認:** `_, ok := s[element]`
    カンマOKイディオムで `ok` が `true` か確認します。
    (`if s[element]` だけだと、キーが存在せずゼロ値 `false` が
    返る場合と区別できないためNG)
*   **削除:** `delete(s, element)`
    (キーが存在しなくてもエラーにならない)
*   **要素数:** `len(s)`
*   **反復処理:** `for element := range s { ... }`
    マップのキーを順不同で取得できます (値 `true` は通常無視)。

値の `bool` (`true`) 自体にはあまり意味はなく、
マップのキーが存在すること自体でセットの要素を表します。
`map[T]bool` はGoでセットを表現する一般的な方法です。
(他に `map[T]struct{}` を使う方法もある)