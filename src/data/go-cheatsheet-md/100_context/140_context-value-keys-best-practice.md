---
title: "Context パッケージ: 値のキーに関するベストプラクティス"
tags: ["context", "concurrency", "WithValue", "Value", "キー", "独自型", "ベストプラクティス"]
---

`context.WithValue` を使って Context に値を関連付ける際、キーの選択には注意が必要です。異なるパッケージ間でキーが衝突するのを防ぐために、**独自に定義した型**をキーとして使うことが強く推奨されています。

このベストプラクティスについては、**「並行処理」**セクションの**「Context による値の伝達 (`context.WithValue`)」** (`090_concurrency/200_context-with-values.md`) でも触れました。

## なぜ独自型をキーに使うのか？

*   **キーの衝突回避:** もしキーとして単純な文字列（例: `"userID"`) を使うと、異なるパッケージが偶然同じ文字列をキーとして使ってしまい、意図しない値の上書きや取得が発生する可能性があります。独自に定義した型（特に非公開の型）をキーとして使えば、その型が定義されたパッケージ内でのみキーを生成・利用できるため、パッケージ間での衝突を確実に防ぐことができます。
*   **静的解析の支援:** 独自型を使うことで、静的解析ツールが Context のキーの使用箇所を特定しやすくなる場合があります。

## 推奨されるキーの定義方法

通常、キーとして使うための**非公開の独自型**を定義し、その型の変数をキーとして使います。

```go title="独自型を Context キーとして使う"
package main

import (
	"context"
	"fmt"
)

// --- キーの定義 ---
// キーとして使うための非公開の独自型 (string のエイリアスでも良い)
type contextKey string
// または type contextKey struct{} でも良い

// このパッケージ内でのみ使うキー変数を定義
const (
	userIDKey    contextKey = "user_id" // 値は何でも良いが、区別できる文字列が一般的
	traceIDKey   contextKey = "trace_id"
)

// --- 値の設定と取得 ---
func main() {
	// 値を設定
	ctx := context.Background()
	ctx = context.WithValue(ctx, userIDKey, 12345) // キーには userIDKey (contextKey 型) を使う
	ctx = context.WithValue(ctx, traceIDKey, "xyz-trace-987")

	// 値を取得
	userIDValue := ctx.Value(userIDKey) // キーには userIDKey を使う
	userID, ok := userIDValue.(int)     // 型アサーション
	if ok {
		fmt.Printf("UserID: %d\n", userID)
	} else {
		fmt.Println("UserID が見つからないか、型が異なります。")
	}

	traceIDValue := ctx.Value(traceIDKey)
	traceID, ok := traceIDValue.(string)
	if ok {
		fmt.Printf("TraceID: %s\n", traceID)
	} else {
		fmt.Println("TraceID が見つからないか、型が異なります。")
	}

	// --- 文字列リテラルをキーとして使う場合 (非推奨) ---
	// ctx = context.WithValue(ctx, "userID", 12345) // 非推奨
	// userIDValue = ctx.Value("userID")             // 非推奨
}

/* 実行結果:
UserID: 12345
TraceID: xyz-trace-987
*/
```

**コード解説:**

*   `type contextKey string` でキー専用の型を定義しています（空の構造体 `struct{}` でも構いません）。
*   `const userIDKey contextKey = "user_id"` で、`contextKey` 型の定数をキーとして定義しています。値の `"user_id"` 自体に特別な意味はなく、他のキーと区別できれば何でも構いません。
*   `context.WithValue` と `ctx.Value` の両方で、この独自型のキー変数 (`userIDKey`, `traceIDKey`) を使用しています。

このように独自型をキーとして使うことで、異なるパッケージが同じキー名（例えば `"id"`）を使っていたとしても、型が異なるため衝突せず、安全に Context を介した値の受け渡しが可能になります。