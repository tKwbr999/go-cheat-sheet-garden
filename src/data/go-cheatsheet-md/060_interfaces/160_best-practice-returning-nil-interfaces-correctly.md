## タイトル
title: インターフェースのベストプラクティス: `nil` インターフェースを正しく返す

## タグ
tags: ["interfaces", "interface", "nil", "エラー処理", "ベストプラクティス", "ポインタ"]

## コード
```go
package main

import (
	"fmt"
)

type MyError struct{ Message string }
func (e *MyError) Error() string { return e.Message }

// 悪い例: 成功時に *MyError 型の nil ポインタを返す
func processDataBad(fail bool) error {
	if fail { return &MyError{"失敗"} }
	var errPtr *MyError = nil
	return errPtr // (型=*main.MyError, 値=nil) の error が返る
}

// 良い例: 成功時に明示的に nil を返す
func processDataGood(fail bool) error {
	if fail { return &MyError{"失敗"} }
	return nil // (型=nil, 値=nil) の error が返る
}

func main() {
	fmt.Println("--- 悪い例 ---")
	errBad := processDataBad(false) // 成功のはずが...
	fmt.Printf("errBad: (%T, %v)\n", errBad, errBad)
	if errBad != nil {
		// 型情報を持つため nil ではないと判定される！
		fmt.Println(" エラー発生と誤判定:", errBad)
	}

	fmt.Println("\n--- 良い例 ---")
	errGood := processDataGood(false) // 成功
	fmt.Printf("errGood: (%T, %v)\n", errGood, errGood)
	if errGood != nil {
		fmt.Println(" エラー発生:", errGood)
	} else {
		// 正しく nil と判定される
		fmt.Println(" 処理成功")
	}
}

```

## 解説
```text
インターフェース型（特に `error`）を返す関数で
「有効な値がない」「エラーがない」ことを示す `nil` を
返す場合、**どのように `nil` を返すか**が重要です。

**原則:** 具体的な型の `nil` ポインタ等ではなく、
**明示的に `nil` を返す**べきです。

**理由:**
インターフェース変数は内部的に「型情報」と「値」を持ちます。
*   `return nil`: 型も値も `nil` (`err == nil` は `true`)。
*   `var ptr *T = nil; return ptr`: 型情報 `*T` を持ち、値が `nil`。
    インターフェースとしては `nil` ではないため、
    `err == nil` は **`false`** になります。

これは特にエラー処理 `if err != nil` で問題になります。
エラーがないつもりで具体的な型の `nil` ポインタを返すと、
呼び出し側で `err != nil` が `true` になり、
エラーが発生したと誤判定される可能性があります。

コード例の `processDataBad` は `*MyError` の `nil` ポインタを
返してしまうため、`errBad != nil` が `true` になります。
一方、`processDataGood` は明示的に `nil` を返すため、
`errGood != nil` は正しく `false` になります。

**まとめ:**
インターフェース型（特に `error`）を返す関数では、
エラーがない場合は具体的な型の `nil` 値ではなく、
**必ず明示的に `nil` を返す**ようにしましょう。