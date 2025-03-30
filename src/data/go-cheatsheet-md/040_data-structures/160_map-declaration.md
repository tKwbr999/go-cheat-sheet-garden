## タイトル
title: マップ (Map) の宣言

## タグ
tags: ["data-structures", "マップ", "map", "キーバリュー", "辞書", "連想配列", "nil"]

## コード
```go
package main

import "fmt"

func main() {
	// マップの宣言 (初期値なし)
	var scores map[string]int
	var isPrime map[int]bool

	// ゼロ値は nil
	fmt.Printf("scores: %v (%T)\n", scores, scores)
	fmt.Printf("isPrime: %v (%T)\n", isPrime, isPrime)

	if scores == nil {
		fmt.Println("scores は nil マップです。")
	}

	// nil マップの len は 0
	fmt.Printf("len(scores): %d\n", len(scores))

	// nil マップからの読み取りはゼロ値が返る (panic しない)
	fmt.Printf("scores[\"Alice\"]: %d\n", scores["Alice"])

	// nil マップへの書き込みは panic する！
	// scores["Bob"] = 90 // panic: assignment to entry in nil map
}

```

## 解説
```text
**マップ (Map)** は、**キー (Key)** を使って
**値 (Value)** にアクセスするデータ構造です。
(辞書、ハッシュマップ、連想配列とも呼ばれる)

*   **キー:** 値を一意に識別。比較可能な任意の型
    (string, int, bool, struct 等。slice, map, func は不可)。
    キーの重複不可。
*   **値:** キーに関連付けられるデータ。任意の型。
*   **順序なし:** 格納されたペアに特定の順序はない。

**宣言構文:** `var 変数名 map[キーの型]値の型`
例: `var scores map[string]int`

**ゼロ値: `nil`**
初期値を指定せずに `var` で宣言したマップのゼロ値は
**`nil`** です。

**重要: `nil` マップへの書き込みは `panic`**
`nil` マップに対して要素を追加・書き込みしようとすると
**実行時パニック**が発生します。
マップを使う前には `make` やリテラルで初期化が必要です。

ただし、`nil` マップからの要素の読み取り (`scores["key"]`) や
`len()` の呼び出しは安全で、それぞれ値のゼロ値や `0` を返します。