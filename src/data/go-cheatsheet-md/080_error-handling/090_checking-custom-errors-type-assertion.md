## タイトル
title: カスタムエラーの判定 (型アサーション)

## タグ
tags: ["error-handling", "error", "カスタムエラー", "型アサーション", "type assertion", "カンマOK"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// カスタムエラー型 (例)
type OperationError struct {
	Timestamp time.Time; Op string; Code int; Message string
}
func (e *OperationError) Error() string { /* ... 実装 ... */
	return fmt.Sprintf("[%s] Op:%s Code:%d Msg:%s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
}

// カスタムエラーを返す関数 (例)
func performAction(action string, failCode int) error {
	if failCode != 0 {
		return &OperationError{ time.Now(), action, failCode, "問題発生" }
	}
	return nil
}

func main() {
	err := performAction("読込", 404) // エラーを発生させる

	if err != nil {
		fmt.Println("エラー:", err)

		// ★ 型アサーションで *OperationError かチェック ★
		opErr, ok := err.(*OperationError)
		if ok {
			// 成功: opErr は *OperationError 型
			fmt.Println("-> OperationError です")
			fmt.Printf("   コード: %d\n", opErr.Code) // フィールドにアクセス
			if opErr.Code == 404 { fmt.Println("   -> Not Found") }
		} else {
			fmt.Println("-> OperationError ではありません")
		}
	}
}

```

## 解説
```text
カスタムエラー型を使うと、エラーの種類を型で区別し、
固有の情報（エラーコード等）に基づいて詳細な処理ができます。

`error` インターフェース変数 `err` が特定のカスタムエラー型
(`*MyError` など) かどうかを確認し、そうであれば具体的な型の
値としてアクセスするには、**型アサーション**を使います。

**カンマOKイディオム:** `value, ok := err.(TargetType)`
*   `err`: チェックしたい `error` 変数。
*   `TargetType`: 確認したいカスタムエラー型 (通常ポインタ `*MyError`)。
*   `ok`: アサーション成功なら `true` (`bool`)。
*   `value`: 成功なら `TargetType` の値 (ポインタ)、
    失敗なら `nil`。

`ok` が `true` なら、`value` は `TargetType` であることが
保証され、その型のフィールド (`value.Code` など) に
安全にアクセスできます。

コード例では、`performAction` が返した `err` を
`opErr, ok := err.(*OperationError)` でチェックしています。
`ok` が `true` なら `opErr` は `*OperationError` なので、
`opErr.Code` にアクセスしてコードに応じた処理を行っています。

もし `err` が別の種類のエラー (例: `errors.New` で作成) なら、
`ok` は `false` になります。

**注意:** エラーラッピング (`%w`) が使われている場合、
ラップされたエラーの型をチェックするには、型アサーションではなく
**`errors.As`** (後述) を使う方が適切です。
型アサーションはエラーチェーンを辿りません。