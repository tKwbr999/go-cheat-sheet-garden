## タイトル
title: カスタムエラー型の定義

## タグ
tags: ["error-handling", "error", "struct", "interface", "カスタムエラー"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// カスタムエラー型 (構造体)
type OperationError struct {
	Timestamp time.Time
	Op        string
	Code      int
	Message   string
	Err       error // ラップされたエラー (オプション)
}

// Error() メソッドを実装し、error インターフェースを満たす
func (e *OperationError) Error() string {
	// フィールドを使って詳細なメッセージを生成
	msg := fmt.Sprintf("[%s] Op:%s Code:%d Msg:%s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
	if e.Err != nil {
		msg += fmt.Sprintf(" (Cause: %v)", e.Err)
	}
	return msg
}

// (Unwrap() error メソッドを実装するとエラーラッピングをサポート)

func main() {
	// カスタムエラーを生成 (例)
	err := &OperationError{
		Timestamp: time.Now(), Op: "Update", Code: 501, Message: "Failed",
	}

	if err != nil {
		fmt.Println("エラー:", err) // 実装した Error() が呼ばれる
		fmt.Printf("型: %T\n", err) // *main.OperationError
		// if opErr, ok := err.(*OperationError); ok { /* フィールドアクセス */ }
	}
}

```

## 解説
```text
`errors.New` や `fmt.Errorf` では不十分な、
より詳細なエラー情報（エラーコード、発生時刻など）を
保持したり、エラーの種類を**型**として区別したい場合は、
**カスタムエラー型**を定義します。

通常は**構造体 (struct)** を使い、`error` インターフェースを
満たすようにします。

**定義方法:**
1. エラー情報を保持するフィールドを持つ**構造体**を定義する。
   (例: `OperationError` 構造体)
2. その構造体（通常はポインタレシーバ `*MyError`）に対して
   **`Error() string` メソッドを実装**する。
   このメソッド内で、構造体のフィールドを使って
   人間が読めるエラーメッセージ文字列を生成して返す。

コード例では `OperationError` 構造体を定義し、
`Error()` メソッドを実装しています。これにより
`*OperationError` は `error` インターフェースを満たします。

**(オプション) エラーラッピング:**
Go 1.13以降、`Unwrap() error` メソッドを実装すると、
`errors.Is` や `errors.As` がラップされたエラー (`Err` フィールド等) を
辿れるようになります。
```go
func (e *OperationError) Unwrap() error { return e.Err }
```

**利点:**
*   **豊富な情報:** エラーコード、時刻、関連データ等を構造化して保持できる。
*   **型の区別:** 型アサーションや `errors.As` (後述) で
    特定のエラー型を判別し、型固有の情報に基づいた処理が可能。
*   **エラーラッピング:** `Unwrap()` 実装で原因追跡が容易に。

詳細なエラー情報を扱いたい場合にカスタムエラー型は有効です。