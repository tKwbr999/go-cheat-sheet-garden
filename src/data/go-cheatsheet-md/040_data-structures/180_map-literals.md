## タイトル
title: マップリテラルによる作成と初期化

## タグ
tags: ["data-structures", "マップ", "map", "初期化", "リテラル"]

## コード
```go
package main

import "fmt"

func main() {
	// マップリテラルで初期化
	ages := map[string]int{
		"Alice":   30,
		"Bob":     25,
		"Charlie": 35, // 最後のカンマ推奨
	}
	fmt.Printf("ages: %v (len=%d)\n", ages, len(ages))

	// 空のマップリテラル (nil ではない)
	emptyMap := map[string]bool{}
	fmt.Printf("emptyMap: %v (len=%d)\n", emptyMap, len(emptyMap))
	if emptyMap != nil {
		fmt.Println("emptyMap は nil ではありません")
	}
	emptyMap["active"] = true // 要素を追加できる
	fmt.Printf("追加後 emptyMap: %v\n", emptyMap)

	// var nilMap map[string]int // これは nil
	// nilMap["key"] = 1 // panic
}

```

## 解説
```text
`make` 以外に、**マップリテラル**を使って
マップの作成と初期化を同時に行えます。
配列/スライスリテラルと似た構文です。

**構文:**
`変数名 := map[キー型]値型{キー1: 値1, キー2: 値2, ...}`

*   `map[キー型]値型`: マップの型を指定。
*   `{キー1: 値1, ...}`: `{}` 内に初期要素の
    キーと値のペアを `キー: 値` 形式で記述し、
    カンマ `,` で区切る。
*   **最後の要素の後にもカンマ `,` を付ける**のが
    Goでは推奨されるスタイルです (差分が見やすい)。
*   `:=` での宣言・初期化が一般的。

マップリテラルは内部的に `make` を呼び出し、
指定されたキーバリューペアをマップに追加します。

**空のマップリテラル:** `map[キー型]値型{}`
中括弧 `{}` だけを書くと、要素数が 0 の
**空のマップ**が作成されます。
これは `make(map[キー型]値型)` と同じ効果があり、
**`nil` ではありません**。そのため、後から要素を追加できます。
(比較: `var m map[K]V` は `nil` マップで、書き込み不可)

**`make` vs リテラル:**
*   初期値があるならリテラルが簡潔。
*   空のマップ作成はどちらでも良い (`make` or `{}`)。
*   初期容量を指定したいなら `make`。