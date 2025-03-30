## タイトル
title: `error` インターフェース

## タグ
tags: ["error-handling", "error", "interface", "エラー", "Error()"]

## コード
```go
package main

import "fmt"

// 独自のエラー型
type MyError struct {
	Operation string
	Code      int
	Message   string
}

// Error() メソッドを実装し、error インターフェースを満たす
func (e *MyError) Error() string {
	return fmt.Sprintf("Op:'%s' Code:%d Msg:'%s'", e.Operation, e.Code, e.Message)
}

// エラーを返す可能性のある関数
func performOperation(fail bool) error { // 戻り値は error
	if fail {
		// *MyError は error を満たすので返せる
		return &MyError{"データ処理", 500, "内部エラー"}
	}
	return nil // 成功時は nil を返す
}

func main() {
	// 成功ケース
	err1 := performOperation(false)
	if err1 != nil {
		fmt.Println("エラー:", err1.Error()) // Error() でメッセージ取得
	} else {
		fmt.Println("成功")
	}

	// 失敗ケース
	err2 := performOperation(true)
	if err2 != nil {
		fmt.Println("エラー:", err2.Error()) // 実装した Error() が呼ばれる
		fmt.Printf("エラーの型: %T\n", err2) // *main.MyError
	} else {
		fmt.Println("成功")
	}
}

```

## 解説
```text
Goには `try-catch` のような例外処理はなく、
**エラーを通常の戻り値として**扱います。
エラー発生可能性のある関数は `error` 型の値を返します。

**`error` インターフェース:**
Goのエラー処理の中心となる組み込みインターフェースです。
```go
type error interface {
    Error() string
}
```
*   `Error() string` という一つのメソッドだけを要求します。
*   `Error()` はエラー内容を表す**文字列**を返します。

**実装:**
`Error() string` メソッドを持つ**任意の型**は、
暗黙的に `error` インターフェースを実装しているとみなされ、
エラーとして扱えます。

コード例では `MyError` 構造体を定義し、
`func (e *MyError) Error() string` で `Error()` メソッドを
実装しています。これにより `*MyError` 型は `error` を満たします。

`performOperation` 関数は `error` を返します。
*   失敗時: `*MyError` 型の値を `error` として返す。
*   成功時: `error` 型のゼロ値である `nil` を返す。

呼び出し側 (`main`) では、関数の戻り値を `if err != nil` で
チェックするのが基本的なエラー処理パターンです。
エラーがある場合 (`err != nil`)、`err.Error()` で
エラーメッセージ文字列を取得できます。

この `error` インターフェースと「エラーは値」という考え方が
Goのエラー処理の基礎です。