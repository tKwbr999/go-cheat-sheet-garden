---
title: "データ構造: `make` 関数によるマップ (Map) の作成"
tags: ["data-structures", "マップ", "map", "make", "初期化", "容量"]
---

前のセクションで見たように、`var` で宣言しただけのマップは `nil` であり、要素を追加しようとするとパニックが発生します。マップにキーと値のペアを追加するには、まずマップを**初期化**する必要があります。

マップを初期化する主要な方法の一つが、スライスと同様に組み込み関数の **`make`** を使うことです。

## `make` によるマップの作成

`make` 関数を使ってマップを作成（初期化）します。`make` で作成されたマップは `nil` ではなく、要素を追加できる状態になります。

**構文:**
```go
// 基本形
変数名 := make(map[キーの型]値の型)

// 初期容量を指定 (オプション)
変数名 := make(map[キーの型]値の型, 初期容量)
```

*   `make(map[キーの型]値の型)`: 指定されたキーと値の型を持つ、空のマップを作成します。
*   `make(map[キーの型]値の型, 初期容量)`: オプションの第二引数 `初期容量` に整数を指定すると、その個数程度の要素を格納するための初期メモリ領域を確保した状態でマップを作成します。これは、最初からマップにある程度の数の要素が入ることが分かっている場合に、パフォーマンスを最適化するのに役立ちます（要素追加時のメモリ再割り当ての回数を減らせる可能性がある）。ただし、これはあくまでヒントであり、厳密な容量保証ではありません。

```go title="make を使ったマップの作成と初期化"
package main

import "fmt"

func main() {
	// --- make で空のマップを作成 ---
	// キーが string, 値が int のマップを作成
	scores := make(map[string]int)
	fmt.Printf("scores (make): %v (len=%d)\n", scores, len(scores))

	// make で作成したマップは nil ではない
	if scores == nil {
		fmt.Println("scores は nil です")
	} else {
		fmt.Println("scores は nil ではありません")
	}

	// make で作成したマップには要素を追加できる
	scores["Alice"] = 95
	scores["Bob"] = 88
	fmt.Printf("要素追加後の scores: %v (len=%d)\n", scores, len(scores))

	// --- make で初期容量を指定してマップを作成 ---
	// おおよそ 10 個程度の要素が入ることを見越して初期容量を指定
	ages := make(map[string]int, 10)
	fmt.Printf("\nages (make with capacity): %v (len=%d)\n", ages, len(ages))
	// 初期容量を指定しても、作成直後の長さ (len) は 0

	ages["Charlie"] = 30
	ages["David"] = 25
	fmt.Printf("要素追加後の ages: %v (len=%d)\n", ages, len(ages))
}

/* 実行結果:
scores (make): map[] (len=0)
scores は nil ではありません
要素追加後の scores: map[Alice:95 Bob:88] (len=2)

ages (make with capacity): map[] (len=0)
要素追加後の ages: map[Charlie:30 David:25] (len=2)
*/
```

**コード解説:**

*   `scores := make(map[string]int)`: 空の `map[string]int` を作成し、`scores` に代入します。このマップは `nil` ではなく、要素を追加できる状態です。作成直後の長さは `0` です。
*   `scores["Alice"] = 95`: `make` で初期化されたマップ `scores` にキー `"Alice"` と値 `95` のペアを追加します。
*   `ages := make(map[string]int, 10)`: 初期容量のヒントを `10` として `map[string]int` を作成します。これは、将来的に約10個の要素が追加される可能性があることをランタイムに伝えます。作成直後の長さは `0` ですが、内部的にはある程度のメモリが確保されている可能性があります。

マップを使う前には、`make` 関数（または次のセクションで説明するマップリテラル）を使って初期化することを忘れないようにしましょう。