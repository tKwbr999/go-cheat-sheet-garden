---
title: "エラー処理: カスタムエラーの判定 (型アサーション)"
tags: ["error-handling", "error", "カスタムエラー", "型アサーション", "type assertion", "カンマOK"]
---

カスタムエラー型を使う利点の一つは、エラーの種類を型として区別し、その型が持つ固有の情報（エラーコードなど）に基づいて、より詳細なエラーハンドリングを行えることです。

`error` インターフェース型の変数に格納されたエラーが、特定のカスタムエラー型であるかどうかを確認し、そうであればその具体的な型の値としてアクセスするには、**型アサーション (Type Assertion)** を使います。

## 型アサーションによるカスタムエラーのチェック

型アサーションのカンマOKイディオム `value, ok := err.(TargetType)` を使います。

*   `err`: チェックしたい `error` 型の変数。
*   `TargetType`: 確認したい具体的なカスタムエラー型（通常はポインタ型、例: `*MyError`）。
*   `value`: アサーションが成功した場合、`TargetType` の値（ポインタ）が代入されます。失敗した場合は `TargetType` のゼロ値 (`nil`) が代入されます。
*   `ok`: アサーションが成功した場合は `true`、失敗した場合は `false` が代入されます。

`ok` が `true` であれば、`value` は `TargetType` であることが保証されるため、その型のフィールドに安全にアクセスできます。

## コード例

`070_defining-custom-error-types.md` で定義した `OperationError` を使ってみましょう。

```go title="型アサーションによるカスタムエラーチェック"
package main

import (
	"errors"
	"fmt"
	"time"
)

// --- カスタムエラー型 (再掲) ---
type OperationError struct {
	Timestamp time.Time
	Op        string
	Code      int
	Message   string
}

func (e *OperationError) Error() string {
	return fmt.Sprintf("[%s] 操作 '%s' でエラー (コード: %d): %s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
}

// --- エラーを返す関数 (再掲) ---
func performAction(action string, failCode int) error {
	fmt.Printf("アクション '%s' を実行中...\n", action)
	if failCode != 0 {
		// 失敗した場合、*OperationError を error として返す
		return &OperationError{
			Timestamp: time.Now(),
			Op:        action,
			Code:      failCode, // 引数で受け取ったコードを設定
			Message:   "処理中に問題が発生",
		}
	}
	// 成功した場合は nil を返す
	return nil
}

func main() {
	// --- エラーハンドリング ---
	err1 := performAction("データ読み込み", 404) // 404 エラーを発生させる
	if err1 != nil {
		fmt.Println("エラー発生:", err1)

		// ★ 型アサーションで *OperationError かどうかをチェック ★
		// opErr には *OperationError 型の値、ok には bool 値が入る
		opErr, ok := err1.(*OperationError)
		if ok {
			// アサーション成功！ err1 は *OperationError 型だった
			fmt.Println("-> これは OperationError です。")
			// opErr は *OperationError 型なので、フィールドにアクセスできる
			fmt.Printf("   エラーコード: %d\n", opErr.Code)
			fmt.Printf("   発生時刻: %s\n", opErr.Timestamp.Format(time.Kitchen))

			// エラーコードに基づいてさらに処理を分岐できる
			if opErr.Code == 404 {
				fmt.Println("   -> データが見つかりませんでした。")
			}
		} else {
			// err1 は *OperationError 型ではなかった
			fmt.Println("-> これは OperationError ではありません。")
		}
	}

	fmt.Println("---")

	// 別の種類のエラー (errors.New で作成)
	err2 := errors.New("これは別の種類のエラーです")
	fmt.Println("エラー発生:", err2)
	opErr2, ok2 := err2.(*OperationError)
	if ok2 {
		fmt.Println("-> これは OperationError です。")
		fmt.Printf("   エラーコード: %d\n", opErr2.Code)
	} else {
		// err2 は *OperationError 型ではないので、こちらが実行される
		fmt.Println("-> これは OperationError ではありません。")
	}
}

/* 実行結果 (時刻は実行時に依存):
アクション 'データ読み込み' を実行中...
エラー発生: [2025-03-28T17:20:00+09:00] 操作 'データ読み込み' でエラー (コード: 404): 処理中に問題が発生
-> これは OperationError です。
   エラーコード: 404
   発生時刻: 5:20PM
   -> データが見つかりませんでした。
---
エラー発生: これは別の種類のエラーです
-> これは OperationError ではありません。
*/
```

**コード解説:**

*   `opErr, ok := err1.(*OperationError)`: `error` 型の変数 `err1` が、実際には `*OperationError` 型の値を持っているかどうかをチェックしています。
*   `if ok { ... }`: `ok` が `true` であれば、アサーションは成功し、`opErr` は `*OperationError` 型の有効なポインタとなります。このブロック内では、`opErr.Code` や `opErr.Timestamp` のように、`OperationError` 構造体のフィールドに安全にアクセスできます。
*   `else { ... }`: `ok` が `false` であれば、`err1` は `*OperationError` 型ではなかったことを意味します。`opErr` には `nil` が入ります。
*   `err2` のケースでは、`errors.New` で作成されたエラーは `*OperationError` 型ではないため、型アサーションは失敗し `ok2` は `false` になります。

型アサーションは、インターフェース変数に格納されたエラーが特定のカスタムエラー型であるかを判別し、その型固有の情報に基づいて処理を行うための基本的な方法です。ただし、エラーラッピング (`%w`) を使っている場合は、ラップされたエラーの型をチェックするために、次に説明する `errors.As` を使う方がより適切です。