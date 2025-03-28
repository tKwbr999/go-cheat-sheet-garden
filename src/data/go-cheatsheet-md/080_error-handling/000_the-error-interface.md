---
title: "エラー処理: `error` インターフェース"
tags: ["error-handling", "error", "interface", "エラー", "Error()"]
---

Go言語には、他の多くの言語に見られるような `try-catch` 構文による例外処理の仕組みがありません。その代わりに、Goでは**エラーを通常の戻り値として**扱います。エラーが発生する可能性のある関数は、戻り値の一つとして `error` 型の値を返すのが一般的です。

## `error` インターフェース

Goのエラー処理の中心となるのが、組み込みの **`error`** インターフェースです。このインターフェースは非常にシンプルで、以下のように定義されています。

```go
type error interface {
    Error() string
}
```

*   `error` はインターフェース型です。
*   このインターフェースは、`Error() string` という**一つのメソッド**だけを要求します。
*   `Error()` メソッドは、そのエラーの内容を表す**文字列**を返すことが期待されます。この文字列は、ログ出力やユーザーへの表示など、人間がエラー内容を理解するために使われます。

## `error` インターフェースの実装

Goのインターフェース実装は暗黙的なので、**`Error() string` というメソッドを持つ任意の型**は、自動的に `error` インターフェースを満たしているとみなされ、エラーとして扱うことができます。

```go title="error インターフェースの簡単な実装例"
package main

import "fmt"

// --- 独自のエラー型を定義 ---
// MyError 構造体
type MyError struct {
	Operation string // どの操作でエラーが起きたか
	Code      int    // エラーコード
	Message   string // 詳細メッセージ
}

// --- MyError 型に Error() string メソッドを実装 ---
// これにより、MyError 型 (または *MyError 型) は error インターフェースを満たす
func (e *MyError) Error() string {
	// エラー情報を整形した文字列を返す
	return fmt.Sprintf("操作 '%s' でエラーが発生しました (コード: %d): %s",
		e.Operation, e.Code, e.Message)
}

// --- エラーを返す可能性のある関数 ---
func performOperation(fail bool) error { // 戻り値の型は error インターフェース
	if fail {
		// エラーが発生した場合、*MyError 型の値を error として返す
		// *MyError は Error() メソッドを持つので error インターフェースを満たす
		return &MyError{
			Operation: "データ処理",
			Code:      500,
			Message:   "内部的な問題が発生",
		}
	}
	// 成功した場合は nil を返す (error インターフェースのゼロ値)
	return nil
}

func main() {
	// --- 関数の呼び出しとエラーチェック ---
	err1 := performOperation(false) // 成功するケース
	if err1 != nil {
		// err1 は nil なので、ここは実行されない
		fmt.Println("エラー発生:", err1.Error()) // Error() メソッドでメッセージ取得
		// fmt.Printf("エラーの具体的な型: %T\n", err1)
	} else {
		fmt.Println("操作は成功しました。")
	}

	fmt.Println("---")

	err2 := performOperation(true) // 失敗するケース
	if err2 != nil {
		// err2 は nil ではない (*MyError 型の値) ので、こちらが実行される
		fmt.Println("エラー発生:", err2.Error()) // 実装した Error() メソッドが呼ばれる
		fmt.Printf("エラーの具体的な型: %T\n", err2) // *main.MyError

		// 型アサーションを使って具体的なエラー型にアクセスできる (詳細は後述)
		// if myErr, ok := err2.(*MyError); ok {
		// 	fmt.Println("エラーコード:", myErr.Code)
		// }
	} else {
		fmt.Println("操作は成功しました。")
	}
}

/* 実行結果:
操作は成功しました。
---
エラー発生: 操作 'データ処理' でエラーが発生しました (コード: 500): 内部的な問題が発生
エラーの具体的な型: *main.MyError
*/
```

**コード解説:**

*   `MyError` 構造体を定義し、エラーに関する情報（操作名、コード、メッセージ）を保持できるようにしています。
*   `func (e *MyError) Error() string` で、`*MyError` 型（`MyError` へのポインタ）に対して `Error()` メソッドを実装しています。これにより、`*MyError` 型は `error` インターフェースを満たします。
*   `performOperation` 関数は、戻り値として `error` インターフェース型を返します。
    *   失敗した場合は、`&MyError{...}` という `*MyError` 型の値を返しています。これは `error` インターフェースを満たすため、問題なく返すことができます。
    *   成功した場合は、`error` インターフェースのゼロ値である `nil` を返します。
*   `main` 関数では、`performOperation` の戻り値 `err1`, `err2` を `!= nil` でチェックしています。
*   `err2 != nil` が `true` の場合、`err2.Error()` を呼び出すと、`MyError` 型で実装した `Error()` メソッドが実行され、整形されたエラーメッセージが表示されます。
*   `%T` を使うと、インターフェース変数に格納されている具体的な型 (`*main.MyError`) を確認できます。

この `error` インターフェースと、「エラーは値である」という考え方が、Goのシンプルで堅牢なエラー処理の基礎となっています。次のセクションでは、標準ライブラリを使って簡単に `error` 値を作成する方法を見ていきます。