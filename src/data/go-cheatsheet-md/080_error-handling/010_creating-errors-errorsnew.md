---
title: "エラー処理: 簡単なエラーの作成 `errors.New`"
tags: ["error-handling", "error", "errors", "errors.New"]
---

Goで `error` インターフェースを満たす値を最も簡単に作成する方法の一つが、標準ライブラリの **`errors`** パッケージにある **`New`** 関数を使うことです。

`import "errors"` として利用します。

## `errors.New()` の使い方

`errors.New()` 関数は、引数として受け取った**エラーメッセージ文字列**をもとに、新しい `error` 型の値を生成して返します。

**構文:** `err := errors.New("エラーメッセージ文字列")`

*   引数には、エラーの内容を示す文字列を渡します。
*   戻り値 `err` は `error` インターフェースを満たす値です。
*   `err.Error()` を呼び出すと、`errors.New` に渡した元のエラーメッセージ文字列が返されます。
*   `errors.New` で作成されたエラーは、同じメッセージ文字列を使って作成されたとしても、互いに **`==` で比較すると `false`** になります（異なるエラー値として扱われます）。特定の種類のエラーかどうかを判定したい場合は、後述する `errors.Is` やカスタムエラー型を使います。

```go title="errors.New の使用例"
package main

import (
	"errors" // errors パッケージをインポート
	"fmt"
)

// 何らかの処理を行い、失敗したら errors.New でエラーを返す関数
func checkValue(value int) error {
	if value < 0 {
		// errors.New で簡単なエラーメッセージを持つ error 値を作成して返す
		return errors.New("値が負数です")
	}
	if value == 0 {
		// 別のエラーメッセージ
		return errors.New("値がゼロです")
	}
	// 成功時は nil を返す
	return nil
}

func main() {
	// --- エラーが発生しない場合 ---
	err1 := checkValue(10)
	if err1 != nil {
		fmt.Println("エラー1:", err1) // err1.Error() と同じ
	} else {
		fmt.Println("checkValue(10): 成功")
	}

	// --- エラーが発生する場合 ---
	err2 := checkValue(-5)
	if err2 != nil {
		// err2.Error() でエラーメッセージを取得できる
		fmt.Println("エラー2:", err2.Error())
		fmt.Printf("エラー2の型: %T\n", err2) // *errors.errorString (内部的な型)
	} else {
		fmt.Println("checkValue(-5): 成功")
	}

	err3 := checkValue(0)
	if err3 != nil {
		fmt.Println("エラー3:", err3)
	} else {
		fmt.Println("checkValue(0): 成功")
	}

	// --- errors.New で作成されたエラーの比較 ---
	errA := errors.New("同じメッセージ")
	errB := errors.New("同じメッセージ")

	// 同じメッセージから作られても、異なるエラー値として扱われる
	if errA == errB {
		fmt.Println("errA と errB は同じエラーです (==)")
	} else {
		fmt.Println("errA と errB は異なるエラーです (==)") // こちらが実行される
	}
}

/* 実行結果:
checkValue(10): 成功
エラー2: 値が負数です
エラー2の型: *errors.errorString
エラー3: 値がゼロです
errA と errB は異なるエラーです (==)
*/
```

**コード解説:**

*   `errors.New("値が負数です")` は、`"値が負数です"` というメッセージを持つ `error` 型の値を生成します。
*   `checkValue` 関数は、`value` が負またはゼロの場合に、`errors.New` で作成したエラーを返します。
*   `main` 関数では、`checkValue` から返されたエラーを `err != nil` でチェックし、エラーがあれば `err.Error()`（または単に `err` を `fmt.Println` などに渡す）でメッセージを表示しています。
*   `errA == errB` の比較が `false` になることから、`errors.New` は呼び出すたびに内部的に異なるエラー値を生成することがわかります。

`errors.New` は、エラーメッセージが固定で、追加の情報が必要ない場合に、手軽に `error` 値を作成する方法として便利です。より動的な情報（発生箇所、具体的な値など）をエラーメッセージに含めたい場合は、次のセクションで説明する `fmt.Errorf` を使うのが一般的です。