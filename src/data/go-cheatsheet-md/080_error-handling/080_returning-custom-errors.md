## タイトル
title: カスタムエラーを返す

## タグ
tags: ["error-handling", "error", "struct", "interface", "カスタムエラー", "return"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// カスタムエラー型 (前のセクションで定義)
type OperationError struct {
	Timestamp time.Time; Op string; Code int; Message string
}
func (e *OperationError) Error() string { /* ... 実装 ... */
	return fmt.Sprintf("[%s] Op:%s Code:%d Msg:%s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
}


// カスタムエラーを返す関数
func performAction(action string, shouldFail bool) error { // 戻り値は error
	fmt.Printf("アクション '%s' 実行...\n", action)
	if shouldFail {
		// 失敗時: *OperationError を error として返す
		return &OperationError{
			Timestamp: time.Now(), Op: action, Code: 400, Message: "無効な入力",
		}
	}
	// 成功時: nil を返す
	return nil
}

func main() {
	// 成功ケース
	err1 := performAction("登録", false)
	if err1 == nil { fmt.Println("-> 成功") }

	// 失敗ケース
	err2 := performAction("削除", true)
	if err2 != nil {
		fmt.Println("エラー:", err2) // 実装した Error() が呼ばれる
		fmt.Printf("型: %T\n", err2) // *main.OperationError
	}
}

```

## 解説
```text
カスタムエラー型 (例: `OperationError`) を定義したら、
通常の `error` 値と同様に関数の戻り値として使えます。

**カスタムエラーを返す際のポイント:**
*   **戻り値は `error`:** 関数の戻り値の型は、具体的な
    カスタムエラー型 (`*OperationError`) ではなく、
    `error` インターフェースとして宣言するのが一般的です。
    これにより呼び出し側は実装の詳細に依存せずに済みます。
*   **ポインタで返す:** 構造体で定義したカスタムエラーは、
    通常はその**ポインタ** (`&OperationError{...}`) を
    `error` として返します。
    (大きな構造体のコピーコスト回避や、`nil` 判定のため)
*   **成功時は `nil`:** エラーがない場合は `nil` を返します。
    (具体的な型の `nil` ポインタではなく、明示的に `nil` を返す)

コード例の `performAction` 関数は、失敗時に
`*OperationError` 型の値を `error` インターフェースとして
返しています。成功時は `nil` を返します。

呼び出し側 (`main`) では、他のエラーと同様に
`if err != nil` でチェックし、`err.Error()` で
カスタムエラー型で実装された `Error()` メソッドの結果
(詳細なエラーメッセージ) を取得できます。

次のセクションでは、型アサーションや `errors.As` を使って、
受け取った `error` が特定のカスタムエラー型かを確認し、
そのフィールドにアクセスする方法を見ます。