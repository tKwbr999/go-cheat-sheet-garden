## タイトル
title: `make` 関数によるマップ (Map) の作成

## タグ
tags: ["data-structures", "マップ", "map", "make", "初期化", "容量"]

## コード
```go
package main

import "fmt"

func main() {
	// make で空のマップを作成
	scores := make(map[string]int)
	fmt.Printf("scores (make): %v (len=%d)\n", scores, len(scores))

	// make で作成したマップは nil ではない
	if scores != nil {
		fmt.Println("scores は nil ではありません")
	}

	// 要素を追加できる
	scores["Alice"] = 95
	scores["Bob"] = 88
	fmt.Printf("追加後 scores: %v (len=%d)\n", scores, len(scores))

	// 初期容量を指定して作成 (パフォーマンス最適化のヒント)
	ages := make(map[string]int, 10)
	fmt.Printf("\nages (cap hint): %v (len=%d)\n", ages, len(ages))
	ages["Charlie"] = 30
	fmt.Printf("追加後 ages: %v (len=%d)\n", ages, len(ages))
}

```

## 解説
```text
`var m map[K]V` で宣言したマップは `nil` であり、
要素を追加しようとすると `panic` します。
マップを使うには**初期化**が必要です。
その主な方法が組み込み関数 **`make`** です。
(`make` はスライス、マップ、チャネルの初期化に使う)

**`make` によるマップ作成:**
`make` で作成されたマップは `nil` ではなく、
要素を追加できる状態になります (長さは 0)。

**構文:**
```go
// 基本形
m1 := make(map[キー型]値型)

// 初期容量を指定 (オプション)
m2 := make(map[キー型]値型, 初期容量)
```
*   `make(map[K]V)`: 空のマップを作成。
*   `make(map[K]V, cap)`: `cap` 個程度の要素を
    格納する初期メモリ領域を確保するヒントを与える。
    要素追加時のメモリ再割り当て回数を減らせる可能性があり、
    パフォーマンス最適化に繋がることがあります。
    ただし、作成直後の長さ (`len`) は 0 です。

コード例では `scores` を基本形で、`ages` を初期容量指定で
作成し、それぞれに要素を追加しています。

マップを使う前には `make` (またはマップリテラル) で
初期化することを忘れないようにしましょう。