## タイトル
title: エラー処理: 簡単なエラーの作成 `errors.New`

## タグ
tags: ["error-handling", "error", "errors", "errors.New"]

## コード
```go
package main

import (
	"errors" // errors パッケージ
	"fmt"
)

// 失敗したら errors.New でエラーを返す関数
func checkValue(value int) error {
	if value < 0 {
		return errors.New("値が負数です") // エラーメッセージを指定
	}
	// 成功時は nil
	return nil
}

func main() {
	// 成功ケース
	err1 := checkValue(10)
	if err1 == nil {
		fmt.Println("checkValue(10): 成功")
	}

	// 失敗ケース
	err2 := checkValue(-5)
	if err2 != nil {
		fmt.Println("エラー:", err2) // err2.Error() と同じ
		fmt.Printf("エラー型: %T\n", err2) // *errors.errorString
	}
}

```

## 解説
```text
`error` インターフェースを満たす値を最も簡単に作る方法の一つが、
標準ライブラリ **`errors`** パッケージの **`New`** 関数です。
`import "errors"` で利用します。

**`errors.New()` の使い方:**
引数の**エラーメッセージ文字列**をもとに、新しい `error` 値を生成します。

**構文:** `err := errors.New("エラーメッセージ文字列")`

*   戻り値 `err` は `error` インターフェースを満たします。
*   `err.Error()` で元のメッセージ文字列を取得できます。
    (`fmt.Println(err)` でも表示されます)

コード例の `checkValue` 関数は、値が負の場合に
`errors.New("値が負数です")` で作成したエラーを返します。
呼び出し側は `if err != nil` でエラーをチェックします。

**注意点:**
`errors.New` で作成されたエラーは、たとえ同じメッセージ文字列を
使っていても、`==` で比較すると常に `false` になります
(内部的に異なる値として扱われるため)。
特定のエラーかどうかを判定したい場合は、後述の `errors.Is` や
カスタムエラー型を使います。

`errors.New` は、エラーメッセージが固定で、追加情報が不要な
場合に手軽に `error` 値を作成するのに便利です。
動的な情報を含めたい場合は `fmt.Errorf` が適しています。