---
title: "データ構造: マップリテラルによる作成と初期化"
tags: ["data-structures", "マップ", "map", "初期化", "リテラル"]
---

`make` 関数を使う以外に、**マップリテラル**を使ってマップの作成と初期化を同時に行うこともできます。これは、配列リテラルやスライスリテラルと似た構文です。

## マップリテラルの構文

**構文:** `変数名 := map[キーの型]値の型{キー1: 値1, キー2: 値2, ...}`

*   `map[キーの型]値の型`: 作成するマップの型を指定します。
*   `{キー1: 値1, キー2: 値2, ...}`: 中括弧 `{}` の中に、初期要素となるキーと値のペアを `キー: 値` の形式で記述し、各ペアをカンマ `,` で区切ります。
*   最後の要素の後にもカンマ `,` を付けることができます（Goでは推奨されるスタイルです）。これにより、要素の追加や削除、順序変更が容易になります。
*   `:=` を使って宣言と初期化を同時に行うのが一般的です。`var` を使うこともできます (`var m = map[string]int{"one": 1}`)。

マップリテラルを使うと、Goは内部的に `make` を呼び出してマップを作成し、指定されたキーと値のペアをマップに追加します。

```go title="マップリテラルによる作成と初期化"
package main

import "fmt"

func main() {
	// --- マップリテラルで初期化 ---
	// キーが string, 値が int のマップを作成し、初期値を設定
	ages := map[string]int{
		"Alice":   30, // キー: "Alice", 値: 30
		"Bob":     25,
		"Charlie": 35, // 最後の要素の後にもカンマを付けるのが一般的
	}
	fmt.Printf("ages: %v (len=%d)\n", ages, len(ages))

	// キーが int, 値が string のマップ
	results := map[int]string{
		1: "Success",
		0: "Failure",
		2: "Pending", // 順序は関係ない
	}
	fmt.Printf("results: %v (len=%d)\n", results, len(results))

	// --- 空のマップリテラル ---
	// 中括弧 {} だけを書くと、空だが初期化された (nil ではない) マップが作成される
	emptyMap := map[string]bool{}
	fmt.Printf("\nemptyMap: %v (len=%d)\n", emptyMap, len(emptyMap))

	if emptyMap == nil {
		fmt.Println("emptyMap は nil です")
	} else {
		fmt.Println("emptyMap は nil ではありません (空のマップです)")
	}

	// 空のマップリテラルで作成したマップには要素を追加できる
	emptyMap["active"] = true
	fmt.Printf("要素追加後の emptyMap: %v (len=%d)\n", emptyMap, len(emptyMap))

	// --- 比較: nil マップ ---
	var nilMap map[string]int // 宣言のみ、nil マップ
	fmt.Printf("\nnilMap: %v (len=%d)\n", nilMap, len(nilMap))
	if nilMap == nil {
		fmt.Println("nilMap は nil です")
	}
	// nilMap["key"] = 1 // panic: assignment to entry in nil map
}

/* 実行結果:
ages: map[Alice:30 Bob:25 Charlie:35] (len=3)
results: map[0:Failure 1:Success 2:Pending] (len=3)

emptyMap: map[] (len=0)
emptyMap は nil ではありません (空のマップです)
要素追加後の emptyMap: map[active:true] (len=1)

nilMap: map[] (len=0)
nilMap は nil です
*/
```

**コード解説:**

*   `ages := map[string]int{...}`: `string` をキー、`int` を値とするマップを作成し、3つのキーバリューペアで初期化しています。
*   `results := map[int]string{...}`: `int` をキー、`string` を値とするマップを初期化しています。リテラル内のキーバリューペアの順序は、マップ内部での格納順序とは関係ありません。
*   `emptyMap := map[string]bool{}`: 中括弧だけを指定すると、要素数が 0 の**空のマップ**が作成されます。これは `make(map[string]bool)` と同じ効果があり、`nil` ではありません。そのため、後から要素を追加できます。
*   `var nilMap map[string]int`: 比較のために `nil` マップを宣言しています。こちらには要素を追加できません。

マップリテラルは、特に初期値を持つマップを作成する場合に、`make` よりも簡潔に記述できる便利な方法です。