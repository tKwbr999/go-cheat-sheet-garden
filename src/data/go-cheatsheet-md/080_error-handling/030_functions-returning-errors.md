---
title: "エラー処理: エラーを返す関数"
tags: ["error-handling", "error", "functions", "return", "nil"]
---

Go言語のエラー処理の基本は、エラーが発生する可能性のある関数が、戻り値の一つとして `error` 型の値を返すことです。

このパターンについては、**「関数」**セクションの**「エラーを返す (`error` 型)」** (`030_functions/040_returning-errors.md`) で既に詳しく説明しました。

ここでは、その基本的なパターンを再確認します。

**パターン:**

1.  関数の最後の戻り値の型として `error` を指定します。
2.  関数内でエラーが発生した場合、関連する結果のゼロ値と、`nil` でない `error` 値（`errors.New` や `fmt.Errorf` で作成）を `return` します。
3.  処理が成功した場合は、通常の結果と、エラーがないことを示す `nil` を `return` します。

```go title="エラーを返す関数の基本パターン"
package main

import (
	"errors"
	"fmt"
)

// ゼロ除算をチェックし、エラーを返す関数 (再掲)
func divide(a, b int) (int, error) { // 戻り値は (int, error)
	if b == 0 {
		// 失敗: 結果のゼロ値 (0) とエラーを返す
		return 0, errors.New("ゼロによる除算です")
	}
	// 成功: 計算結果と nil を返す
	return a / b, nil
}

func main() {
	// 呼び出し側でエラーをチェックする
	result1, err1 := divide(10, 2)
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Println("10 / 2 =", result1)
	}

	result2, err2 := divide(10, 0)
	if err2 != nil {
		fmt.Println("エラー:", err2) // こちらが実行される
	} else {
		fmt.Println("10 / 0 =", result2)
	}
}

/* 実行結果:
10 / 2 = 5
エラー: ゼロによる除算です
*/
```

関数から `error` を返し、呼び出し側で `if err != nil` をチェックする、という流れがGoのエラー処理の基本形です。