---
title: "エラー処理: カスタムエラーを返す"
tags: ["error-handling", "error", "struct", "interface", "カスタムエラー", "return"]
---

前のセクションで定義したようなカスタムエラー型は、通常の `error` 値と同様に関数の戻り値として使うことができます。

カスタムエラー型の定義と `Error()` メソッドの実装については、**「カスタムエラー型の定義」** (`080_error-handling/070_defining-custom-error-types.md`) を参照してください。

## カスタムエラーを返す際のポイント

*   **`error` インターフェースとして返す:** 関数の戻り値の型は、具体的なカスタムエラー型（例: `*MyError`）ではなく、`error` インターフェースとして宣言するのが一般的です。これにより、呼び出し側は具体的な実装の詳細を知る必要がなくなります。
*   **ポインタで返す:** カスタムエラーを構造体で定義した場合、通常はその**ポインタ** (`*MyError`) を `error` として返します。
    *   これは、エラー値が `nil` かどうかを正しく判定できるようにするためです（`nil` ポインタを `error` として返すと、インターフェースとしては `nil` ではないが、値は `nil` という状態になるため、通常は避けるべきです。エラーがない場合は明示的に `nil` を返します）。
    *   また、大きな構造体の場合にコピーコストを避ける意味合いもあります。
*   **成功時は `nil` を返す:** エラーが発生しなかった場合は、`error` 型のゼロ値である `nil` を返します。

```go title="カスタムエラーを返す関数の例"
package main

import (
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

// --- カスタムエラーを返す関数 ---
func performAction(action string, shouldFail bool) error { // 戻り値は error インターフェース
	fmt.Printf("アクション '%s' を実行中...\n", action)
	if shouldFail {
		// 失敗した場合、*OperationError を error として返す
		return &OperationError{
			Timestamp: time.Now(),
			Op:        action,
			Code:      400,
			Message:   "無効な入力です",
		}
	}
	// 成功した場合は nil を返す
	return nil
}

func main() {
	// --- 呼び出しとエラーチェック ---
	err1 := performAction("ユーザー登録", false) // 成功ケース
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Println("-> 成功")
	}

	fmt.Println("---")

	err2 := performAction("データ削除", true) // 失敗ケース
	if err2 != nil {
		fmt.Println("エラー:", err2) // 実装した Error() メソッドが呼ばれる
		fmt.Printf("エラーの型: %T\n", err2) // *main.OperationError
	} else {
		fmt.Println("-> 成功")
	}
}

/* 実行結果 (時刻は実行時に依存):
アクション 'ユーザー登録' を実行中...
-> 成功
---
アクション 'データ削除' を実行中...
エラー: [2025-03-28T17:19:00+09:00] 操作 'データ削除' でエラー (コード: 400): 無効な入力です
エラーの型: *main.OperationError
*/
```

カスタムエラー型を使うことで、より詳細なエラー情報を呼び出し元に伝えることができます。呼び出し側では、次のセクションで説明する型アサーションや `errors.As` を使って、エラーが特定のカスタムエラー型であるかを確認し、追加情報にアクセスすることができます。