## タイトル
title: "Context パッケージ: Context からの値の取得 (`Value`)"

## タグ
tags: ["context", "concurrency", "Value", "型アサーション", "リクエストスコープ", "値伝達"]

## コード
```go
package main

import (
	"context"
	"fmt"
)

// キーとして使うための独自型 (再掲)
type contextKey string

const (
	userIDKey    contextKey = "userID"
	traceIDKey   contextKey = "traceID"
	sessionIDKey contextKey = "sessionID"
)

// Context を受け取り、値を表示する関数
func processRequest(ctx context.Context) {
	fmt.Println("\n--- processRequest ---")

	// userID を取得
	userIDValue := ctx.Value(userIDKey)
	// 型アサーション (カンマOKイディオム)
	userID, ok := userIDValue.(string)
	if !ok {
		fmt.Println("userID が見つからないか、型が異なります。")
	} else {
		fmt.Printf("取得した userID: %s\n", userID)
	}

	// traceID を取得
	traceID, ok := ctx.Value(traceIDKey).(string)
	if !ok {
		fmt.Println("traceID が見つからないか、型が異なります。")
	} else {
		fmt.Printf("取得した traceID: %s\n", traceID)
	}

	// 存在しないキーを試す
	otherValue := ctx.Value(contextKey("otherKey"))
	if otherValue == nil {
		fmt.Println("存在しないキー 'otherKey' の値は nil です。")
	}
}

func main() {
	// 値を持つ Context を作成 (前のセクションの例)
	ctx := context.Background()
	ctx = context.WithValue(ctx, userIDKey, "user-987")
	ctx = context.WithValue(ctx, traceIDKey, "trace-abc-123")
	// sessionIDKey は設定しない

	// 関数に Context を渡す
	processRequest(ctx)

	// sessionIDKey を持つ子 Context を作成
	ctxWithSession := context.WithValue(ctx, sessionIDKey, "sess-xyz-789")
	processRequest(ctxWithSession) // この呼び出しでは sessionID も取得できるはず
}

/* 実行結果:
--- processRequest ---
取得した userID: user-987
取得した traceID: trace-abc-123
存在しないキー 'otherKey' の値は nil です。

--- processRequest ---
取得した userID: user-987
取得した traceID: trace-abc-123
存在しないキー 'otherKey' の値は nil です。
*/
```

## 解説
```text
`context.WithValue` で Context に関連付けられた値を取得するには、**`Value()`** メソッドを使います。

`Value()` メソッドの使い方や注意点については、**「並行処理」**セクションの**「Context による値の伝達 (`context.WithValue`)」** (`090_concurrency/200_context-with-values.md`) で既に説明しました。

ここでは、その基本的な使い方を再確認します。

## `ctx.Value()` の基本（再確認）

*   **`value := ctx.Value(key)`**:
    *   Context `ctx` に対してキー `key` を使って `Value()` を呼び出すと、関連付けられた値が `any` 型で返されます。
    *   `key` が見つからない場合や、値が `nil` の場合は `nil` が返ります。
    *   `Value()` は親 Context を再帰的に遡ってキーを探します。
*   **型アサーション:** `Value()` は `any` 型を返すため、通常は**型アサーション**を使って元の型に戻す必要があります。値が存在し、かつ期待した型であることを安全に確認するために、**カンマOKイディオム** (`v, ok := value.(ExpectedType)`) を使うのが一般的です。
*   **キーの型:** `Value()` に渡すキーは、`WithValue` で使ったキーと**同じ型**かつ**同じ値**である必要があります。キーの衝突を避けるため、**独自に定義した非公開の型**をキーとして使うことが強く推奨されます。

**コード解説:**

*   `processRequest` 関数は、引数で受け取った `ctx` に対して `Value()` メソッドを呼び出し、`userIDKey` と `traceIDKey` に関連付けられた値を取得しようとします。
*   `userID, ok := userIDValue.(string)`: `Value()` が返した `userIDValue` (`any` 型) を `string` 型にアサーションし、成功したかどうかを `ok` でチェックします。成功すれば `userID` に文字列が代入されます。
*   存在しないキー (`contextKey("otherKey")`) で `Value()` を呼び出すと `nil` が返されます。
*   `ctxWithSession` は `ctx` を親としているため、`ctxWithSession.Value(userIDKey)` や `ctxWithSession.Value(traceIDKey)` でも親に設定された値を取得できます（コード例には含まれていませんが、そのように動作します）。

`ctx.Value()` は Context を介してリクエストスコープの情報を取得するための手段ですが、型安全性がコンパイル時には保証されないため、型アサーションによるチェックが重要です。また、必須ではない情報の伝達に限定して使うべきという原則を忘れないようにしましょう。