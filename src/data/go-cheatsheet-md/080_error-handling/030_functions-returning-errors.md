## タイトル
title: エラーを返す関数

## タグ
tags: ["error-handling", "error", "functions", "return", "nil"]

## コード
```go
package main

import (
	"errors"
	"fmt"
)

// ゼロ除算をチェックし、エラーを返す関数
func divide(a, b int) (int, error) { // 戻り値に error を含める
	if b == 0 {
		// 失敗: ゼロ値とエラーを返す
		return 0, errors.New("ゼロによる除算")
	}
	// 成功: 結果と nil を返す
	return a / b, nil
}

func main() {
	// 呼び出し側でエラーをチェック
	result1, err1 := divide(10, 2)
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Println("10 / 2 =", result1)
	}

	result2, err2 := divide(10, 0)
	if err2 != nil {
		fmt.Println("エラー:", err2) // エラー発生
	} else {
		fmt.Println("10 / 0 =", result2)
	}
}

```

## 解説
```text
Goのエラー処理の基本は、エラーが発生する可能性のある関数が、
戻り値の一つとして **`error`** 型の値を返すことです。

**パターン:**
1. 関数の最後の戻り値の型として `error` を指定する。
   例: `func MyFunc(...) (ResultType, error)`
2. 関数内でエラーが発生した場合、関連する結果のゼロ値と、
   `nil` でない `error` 値 (`errors.New` や `fmt.Errorf` で作成) を
   `return` する。
   例: `return defaultValue, fmt.Errorf("問題発生: %w", err)`
3. 処理が成功した場合は、通常の結果と、エラーがないことを示す
   `nil` を `return` する。
   例: `return result, nil`

コード例の `divide` 関数はこのパターンに従っています。
ゼロ除算の場合に `0` と `errors.New(...)` を返し、
成功した場合は計算結果と `nil` を返します。

呼び出し側 (`main` 関数) では、関数の戻り値を受け取り、
**`if err != nil`** でエラーが発生したかどうかをチェックするのが
定石です。

この「関数が `error` を返し、呼び出し側が `nil` チェックする」
という流れがGoのエラー処理の基本形です。