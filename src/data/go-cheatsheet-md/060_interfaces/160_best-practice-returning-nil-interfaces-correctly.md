---
title: "インターフェースのベストプラクティス: `nil` インターフェースを正しく返す"
tags: ["interfaces", "interface", "nil", "エラー処理", "ベストプラクティス", "ポインタ"]
---

関数がインターフェース型（特に `error` 型）を返す場合、「有効な値がない」または「エラーが発生しなかった」ことを示すために `nil` を返すことがあります。この際、**どのように `nil` を返すか**が非常に重要です。

**原則:** インターフェース型の戻り値として「無」や「成功」を表す `nil` を返したい場合は、具体的な型の `nil` ポインタなどではなく、**明示的に `nil` を返す**べきです。

## なぜ明示的な `nil` が重要か？

`030_nil-interface-vs-interface-with-nil-value.md` で説明したように、インターフェース変数は内部的に「型情報」と「値」を持っています。

*   **明示的な `nil`:** `return nil` のように返されたインターフェースは、型情報も値も `nil` です (`型=nil, 値=nil`)。これを `== nil` で比較すると `true` になります。
*   **具体的な型の `nil` ポインタ:** 例えば `*MyError` 型の `nil` ポインタを `error` インターフェースとして返した場合、そのインターフェース変数は型情報として `*MyError` を持ち、値として `nil` を持ちます (`型=*MyError, 値=nil`)。型情報を持っているため、これを `== nil` で比較すると **`false`** になってしまいます。

これは、特にエラー処理で `if err != nil` のようなチェックを行う際に、予期せぬ問題を引き起こす可能性があります。エラーがないつもりで具体的な型の `nil` ポインタを返してしまうと、呼び出し側では `err != nil` が `true` になり、エラーが発生したと誤判定してしまうのです。

## コード例: エラーを返す関数の場合

```go title="nil error の返し方: 悪い例と良い例"
package main

import (
	"fmt"
)

// --- 独自のエラー型 (例) ---
type MyError struct {
	Code    int
	Message string
}

// Error() メソッドを実装することで error インターフェースを満たす
func (e *MyError) Error() string {
	return fmt.Sprintf("エラー (コード %d): %s", e.Code, e.Message)
}

// --- エラーを返す関数 ---

// 悪い例: 具体的な型 (*MyError) の nil ポインタを error として返す
func processDataBad(fail bool) error {
	if fail {
		// エラー発生時は具体的なエラー情報を返す (これはOK)
		return &MyError{Code: 1, Message: "処理失敗"}
	} else {
		// ★ 問題点 ★
		// 成功時に *MyError 型の nil ポインタを返す
		var errPtr *MyError = nil
		return errPtr // (型=*main.MyError, 値=nil) の error が返る
	}
}

// 良い例: 成功時は明示的に nil を error として返す
func processDataGood(fail bool) error {
	if fail {
		return &MyError{Code: 2, Message: "処理失敗"}
	} else {
		// ★ 正しい方法 ★
		// 成功時は error 型の nil を返す
		return nil // (型=nil, 値=nil) の error が返る
	}
}

func main() {
	fmt.Println("--- 悪い例 (processDataBad) ---")
	errBad := processDataBad(false) // 成功するはずだが...
	fmt.Printf("errBad: 型=%T, 値=%v\n", errBad, errBad)
	if errBad != nil {
		// errBad は (型=*main.MyError, 値=nil) なので nil ではない！
		fmt.Println("エラーが発生しました (と誤判定される):", errBad) // こちらが実行されてしまう！
	} else {
		fmt.Println("処理は成功しました。")
	}

	fmt.Println("\n--- 良い例 (processDataGood) ---")
	errGood := processDataGood(false) // 成功した場合
	fmt.Printf("errGood: 型=%T, 値=%v\n", errGood, errGood)
	if errGood != nil {
		fmt.Println("エラーが発生しました:", errGood)
	} else {
		// errGood は (型=nil, 値=nil) なので nil と判定される
		fmt.Println("処理は成功しました。") // 正しくこちらが実行される
	}
}

/* 実行結果:
--- 悪い例 (processDataBad) ---
errBad: 型=*main.MyError, 値=<nil>
エラーが発生しました (と誤判定される): <nil>

--- 良い例 (processDataGood) ---
errGood: 型=<nil>, 値=<nil>
処理は成功しました。
*/
```

**コード解説:**

*   `processDataBad(false)` は、成功を示すために `*MyError` 型の `nil` ポインタ `errPtr` を返します。
*   `main` 関数で `errBad := processDataBad(false)` を受け取ると、`errBad` は内部的に型情報 `*main.MyError` を持っているため、`errBad != nil` の比較が `true` になってしまい、エラーが発生したと誤判定されます。表示上は `<nil>` と見えても、インターフェースとしては `nil` ではないのです。
*   `processDataGood(false)` は、成功を示すために明示的に `nil` を返します。
*   `main` 関数で `errGood := processDataGood(false)` を受け取ると、`errGood` は型情報も値も `nil` であるため、`errGood != nil` の比較は正しく `false` となり、成功したと判定されます。

## まとめ

インターフェース型の関数（特に `error` 型を返す関数）で、「有効な値がない」または「エラーがない」ことを示したい場合は、具体的な型の `nil` 値（ポインタなど）を返すのではなく、**必ず明示的に `nil` を返す**ようにしましょう。これにより、呼び出し側での `if value == nil` や `if err != nil` といったチェックが期待通りに動作します。