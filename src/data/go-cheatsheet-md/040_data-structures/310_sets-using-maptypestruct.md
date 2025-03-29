## タイトル
title: データ構造: マップを使ったセットの実装 (map[T]struct{})

## タグ
tags: ["data-structures", "マップ", "map", "セット", "set", "集合", "struct{}", "空の構造体", "メモリ効率"]

## コード
```go
package main

import "fmt"

func main() {
	// セットを作成 (map[int]struct{} を使用)
	numberSet := make(map[int]struct{})

	// 要素の追加 (値は空の構造体リテラル)
	numberSet[1] = struct{}{}
	numberSet[3] = struct{}{}
	numberSet[5] = struct{}{}
	fmt.Printf("追加後: %v (len=%d)\n", numberSet, len(numberSet))

	// 要素の存在確認 (カンマOKイディオム)
	key := 3
	_, exists := numberSet[key]
	if exists { fmt.Printf("'%d' は存在する\n", key) }

	key = 4
	_, exists = numberSet[key]
	if !exists { fmt.Printf("'%d' は存在しない\n", key) }

	// 要素の削除
	delete(numberSet, 5)
	fmt.Printf("削除後: %v (len=%d)\n", numberSet, len(numberSet))

	// 反復処理 (キーのみ取得)
	// for element := range numberSet { fmt.Println(element) }
}

```

## 解説
```text
マップを使ったセット実装のもう一つの方法として、
値の型に**空の構造体 `struct{}`** を使う
`map[T]struct{}` があります。

**空の構造体 `struct{}`:**
フィールドを一切持たない構造体で、
メモリを**消費しません** (サイズゼロ)。

**仕組み:**
セットではキーの存在自体が重要で、マップの値は不要です。
`map[T]bool` の `true` もわずかにメモリを消費しますが、
`struct{}` はメモリ消費がゼロなため、より効率的です。

**操作:**
`map[T]bool` とほぼ同じです。
*   **作成:** `s := make(map[T]struct{})`
*   **追加:** `s[element] = struct{}{}`
    (値として空構造体のリテラル `struct{}{}` を使う)
*   **存在確認:** `_, ok := s[element]` (カンマOKイディオム)
*   **削除:** `delete(s, element)`
*   **反復処理:** `for element := range s { ... }` (キーのみ取得)

**`map[T]bool` vs `map[T]struct{}`:**
*   **メモリ効率:** `map[T]struct{}` の方がわずかに良い。
    要素数が非常に多い場合に差が出る可能性。
*   **可読性/意図:** `map[T]bool` は `true` が存在を示すと
    直感的。`map[T]struct{}` は「値は無意味」という意図が
    より明確とも言える。

どちらも広く使われます。パフォーマンス重視なら `struct{}`、
そうでなければ好みやチーム規約によります。