---
title: "エラー処理: カスタムエラー型の定義"
tags: ["error-handling", "error", "struct", "interface", "カスタムエラー"]
---

`errors.New` や `fmt.Errorf` は手軽に `error` 値を作成できますが、時にはエラーに関する**より多くの情報**（エラーコード、発生時刻、関連データなど）を保持させたい場合や、エラーの種類を**型**として区別したい場合があります。

このような場合、**カスタムエラー型**を定義することができます。Goでは、`error` インターフェース（`Error() string` メソッドを持つ）を満たす任意の型をエラーとして扱えるため、通常は**構造体 (struct)** を使ってカスタムエラー型を定義します。

## カスタムエラー型の定義方法

1.  エラーに関する情報を保持するためのフィールドを持つ**構造体**を定義します。
2.  その構造体（通常はポインタレシーバ `*MyError`）に対して **`Error() string` メソッドを実装**します。このメソッドは、構造体のフィールドを使って、人間が読める形式のエラーメッセージ文字列を返すようにします。

```go title="カスタムエラー型の定義と実装"
package main

import (
	"fmt"
	"time"
)

// --- カスタムエラー型の定義 ---
// OperationError: 操作に関するエラー情報を保持する構造体
type OperationError struct {
	Timestamp time.Time // エラー発生時刻
	Op        string    // 操作名
	Code      int       // エラーコード
	Message   string    // 詳細メッセージ
	Err       error     // ラップされた元のエラー (オプション)
}

// --- Error() メソッドの実装 ---
// *OperationError 型が error インターフェースを満たすようにする
func (e *OperationError) Error() string {
	// 構造体のフィールドを使ってエラーメッセージを組み立てる
	errMsg := fmt.Sprintf("[%s] 操作 '%s' でエラー (コード: %d): %s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
	// もしラップされたエラーがあれば、それもメッセージに含める (例)
	if e.Err != nil {
		errMsg += fmt.Sprintf(" (原因: %v)", e.Err)
	}
	return errMsg
}

// --- (オプション) Unwrap() メソッドの実装 ---
// エラーラッピングをサポートする場合 (Go 1.13+)
// errors.Is や errors.As でラップされたエラーを辿れるようにする
func (e *OperationError) Unwrap() error {
	return e.Err
}

// --- カスタムエラーを返す可能性のある関数 (例) ---
func performComplexOperation(action string, fail bool) error {
	if fail {
		// カスタムエラー型のインスタンスを作成して返す
		// (通常はポインタを返す)
		return &OperationError{
			Timestamp: time.Now(),
			Op:        action,
			Code:      501,
			Message:   "予期せぬ問題が発生しました",
			Err:       nil, // 今回はラップするエラーはない
		}
	}
	fmt.Printf("操作 '%s' は成功しました。\n", action)
	return nil // 成功時は nil
}

func main() {
	// --- カスタムエラーを受け取る ---
	err := performComplexOperation("データ更新", true) // エラーを発生させる

	if err != nil {
		fmt.Println("--- エラー情報 ---")
		// err.Error() で実装した Error() メソッドが呼ばれる
		fmt.Println(err)

		// 型アサーションや errors.As で具体的なエラー情報にアクセスできる (後述)
		fmt.Printf("エラーの具体的な型: %T\n", err) // *main.OperationError
		// if opErr, ok := err.(*OperationError); ok {
		// 	fmt.Println("エラーコード:", opErr.Code)
		// 	fmt.Println("発生時刻:", opErr.Timestamp)
		// }
	} else {
		fmt.Println("操作は正常に完了しました。")
	}
}

/* 実行結果 (時刻は実行時に依存):
--- エラー情報 ---
[2025-03-28T17:18:00+09:00] 操作 'データ更新' でエラー (コード: 501): 予期せぬ問題が発生しました
エラーの具体的な型: *main.OperationError
*/
```

**コード解説:**

*   `OperationError` 構造体は、エラーに関する複数の情報（時刻、操作名、コード、メッセージ、ラップされたエラー）を保持するためのフィールドを定義しています。
*   `func (e *OperationError) Error() string`: `*OperationError` 型に対して `Error()` メソッドを実装しています。これにより `*OperationError` は `error` インターフェースを満たします。メソッド内では、構造体のフィールドを使って詳細なエラーメッセージを生成しています。
*   `func (e *OperationError) Unwrap() error`: (オプション) エラーラッピングをサポートするための `Unwrap()` メソッドを実装しています。これにより、`errors.Is` や `errors.As` が `e.Err` フィールドにラップされたエラーを辿れるようになります。
*   `performComplexOperation` 関数は、失敗した場合に `&OperationError{...}` という `*OperationError` 型の値を `error` として返します。
*   `main` 関数では、返された `error` 値の `Error()` メソッドを呼び出してメッセージを表示し、`%T` でその具体的な型が `*main.OperationError` であることを確認しています。

## カスタムエラー型の利点

*   **豊富な情報:** 単なる文字列メッセージだけでなく、エラーコード、発生時刻、関連データなど、エラーに関する構造化された情報を保持できます。
*   **型の区別:** エラーの種類を型として区別できます。呼び出し側は、型アサーションや `errors.As` を使って特定のエラー型を判別し、その型特有の情報に基づいてより詳細なエラーハンドリングを行うことができます。
*   **エラーラッピング:** `Unwrap()` メソッドを実装することで、エラーの原因を追跡しやすくすることができます。

`errors.New` や `fmt.Errorf` では表現しきれない、より詳細なエラー情報を扱いたい場合に、カスタムエラー型を定義することは非常に有効な手段です。