## タイトル
title: マップ (Map) のキー存在確認 (カンマOKイディオム)

## タグ
tags: ["data-structures", "マップ", "map", "キー存在確認", "カンマOK", "if"]

## コード
```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"Alice": 95,
		"Bob":   0, // 値が 0
	}

	// カンマOKイディオムで存在確認
	scoreBob, okBob := scores["Bob"] // Bob は存在する
	if okBob {
		fmt.Printf("Bob は存在: %d\n", scoreBob) // 存在する (値 0)
	}

	scoreCharlie, okCharlie := scores["Charlie"] // Charlie は存在しない
	if !okCharlie {
		fmt.Printf("Charlie は不在 (ok=%t, value=%d)\n", okCharlie, scoreCharlie) // ok=false, value=0
	}

	// if の初期化ステートメントと組み合わせるのが一般的
	if score, ok := scores["Alice"]; ok {
		fmt.Printf("Alice の点数: %d\n", score)
	} else {
		fmt.Println("Alice は不在")
	}

	if _, ok := scores["David"]; !ok { // 値は不要な場合 _ で無視
		fmt.Println("David は不在")
	}
}

```

## 解説
```text
マップから値を取得する際 (`v := m[key]`)、
キーが存在しないと値の型の**ゼロ値**が返ります。
これだけでは「キーがない」のか「値がゼロ値」なのか
区別できません。

**カンマOKイディオム:**
マップアクセス時にキーの存在有無も確認できます。
`value, ok := マップ名[キー]`

*   `value`: キーに対応する値 (なければゼロ値)。
*   `ok`: キーが存在したか (`bool`)。存在すれば `true`。

この `ok` 変数をチェックすれば、キーの存在を確実に判定できます。

コード例では、`scores["Bob"]` はキーが存在し値が `0` なので
`okBob` は `true`、`scoreBob` は `0` になります。
一方、`scores["Charlie"]` はキーが存在しないので
`okCharlie` は `false`、`scoreCharlie` はゼロ値の `0` になります。

**`if` 文との組み合わせ:**
`if` 文の初期化ステートメントで同時に行うのが一般的です。
```go
if value, ok := m[key]; ok {
    // キーが存在した場合の処理 (value を使う)
} else {
    // キーが存在しなかった場合の処理
}
```
値が不要な場合は `_` で無視できます。
`if _, ok := m[key]; ok { ... }`

カンマOKイディオムは、マップのキー存在を安全かつ明確に
確認するための必須テクニックです。