---
title: "データ構造: マップ (Map) の宣言"
tags: ["data-structures", "マップ", "map", "キーバリュー", "辞書", "連想配列", "nil"]
---

配列やスライスは要素を順番（インデックス）で管理しますが、Goには**キー (Key)** を使って**値 (Value)** にアクセスするデータ構造、**マップ (Map)** も用意されています。他の言語では辞書 (Dictionary)、ハッシュマップ (Hash Map)、連想配列 (Associative Array) などと呼ばれるものに相当します。

## マップ (Map) とは？

マップは、**キーと値のペア**を格納するコレクションです。

*   **キー:** マップ内の値を一意に識別するためのものです。キーを使って値の読み書きや削除を行います。Goのマップのキーには、`==` や `!=` で比較可能な任意の型（文字列、整数、浮動小数点数、真偽値、ポインタ、構造体など。ただしスライス、マップ、関数は不可）を使用できます。同じマップ内でキーは重複できません。
*   **値:** キーに関連付けられて格納されるデータです。値には任意の型を使用できます。
*   **順序なし:** マップに格納されたキーと値のペアには、**特定の順序はありません**。`for range` などで要素を取り出す際、その順序は保証されません。

## マップの宣言

マップを宣言するには、`var` キーワードと以下の構文を使います。

**構文:** `var 変数名 map[キーの型]値の型`

*   `変数名`: マップを識別するための名前。
*   `map`: これがマップ型であることを示すキーワード。
*   `[キーの型]`: マップのキーとして使用する型を指定します。
*   `値の型`: マップの値として格納する型を指定します。

`var` で宣言しただけで初期値を指定しない場合、マップの**ゼロ値**は **`nil`** になります。

**重要な注意点:** `nil` マップに対しては、要素の**追加や書き込みを行うことができません**。実行しようとすると**パニック**が発生します。マップに要素を追加する前には、`make` 関数やリテラルを使ってマップを初期化する必要があります。ただし、`nil` マップからの要素の読み取りや `len()` の呼び出しは安全に行え、それぞれゼロ値や `0` を返します。

```go title="マップの宣言とゼロ値 (nil)"
package main

import "fmt"

func main() {
	// --- マップの宣言 ---
	// キーが string 型、値が int 型のマップを宣言 (初期値なし)
	var scores map[string]int

	// キーが int 型、値が bool 型のマップを宣言
	var isPrime map[int]bool

	// --- ゼロ値 (nil) の確認 ---
	fmt.Printf("scores: %v (型: %T)\n", scores, scores)
	fmt.Printf("isPrime: %v (型: %T)\n", isPrime, isPrime)

	// nil マップかどうかをチェック
	if scores == nil {
		fmt.Println("scores は nil マップです。")
	}

	// nil マップの長さは 0
	fmt.Printf("scores の長さ (len): %d\n", len(scores))

	// nil マップから存在しないキーを読み取ろうとしても panic はしない
	// 存在しないキーに対応する値のゼロ値 (int なら 0) が返る
	fmt.Printf("scores[\"Alice\"]: %d\n", scores["Alice"])

	// --- nil マップへの書き込みは panic ---
	fmt.Println("\nnil マップへの書き込みを試みます...")
	// 以下の行を実行すると panic が発生する
	// scores["Bob"] = 90
	// panic: assignment to entry in nil map
	fmt.Println("（panic するため、この行は実行されません）")
}

/* scores["Bob"] = 90 のコメントを外した場合の実行例:
scores: map[] (型: map[string]int)
isPrime: map[] (型: map[int]bool)
scores は nil マップです。
scores の長さ (len): 0
scores["Alice"]: 0

nil マップへの書き込みを試みます...
panic: assignment to entry in nil map

goroutine 1 [running]:
main.main()
        /path/to/your/file.go:34 +0x??
exit status 2
*/

/* コメントアウトしたままの実行結果:
scores: map[] (型: map[string]int)
isPrime: map[] (型: map[int]bool)
scores は nil マップです。
scores の長さ (len): 0
scores["Alice"]: 0

nil マップへの書き込みを試みます...
（panic するため、この行は実行されません）
*/
```

**コード解説:**

*   `var scores map[string]int`: キーが `string`、値が `int` のマップ `scores` を宣言しています。型は `map[string]int` です。
*   初期値を指定していないため、`scores` と `isPrime` は `nil` で初期化されます。
*   `len(scores)` は `0` を返します。
*   `scores["Alice"]` のように `nil` マップから存在しないキーを読み取ろうとしても、パニックは発生せず、値の型のゼロ値（この場合は `int` の `0`）が返されます。
*   `scores["Bob"] = 90` のように `nil` マップに要素を追加しようとすると、実行時にパニックが発生します。

マップを使う前には、`make` 関数やマップリテラルを使って初期化することが不可欠です。次のセクションでその方法を見ていきます。