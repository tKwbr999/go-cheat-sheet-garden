---
title: "Context パッケージ: Context への値の追加 (`WithValue`)"
tags: ["context", "concurrency", "WithValue", "リクエストスコープ", "値伝達"]
---

`context` パッケージは、キャンセルやデッドラインだけでなく、リクエスト処理の過程で必要となる**リクエストスコープの値**（リクエストID、ユーザーID、トレース情報など）を関数呼び出し間で伝達する手段も提供します。これは **`context.WithValue`** 関数を使って行います。

`WithValue` の使い方や注意点については、**「並行処理」**セクションの**「Context による値の伝達 (`context.WithValue`)」** (`090_concurrency/200_context-with-values.md`) で既に詳しく説明しました。

ここでは、その基本的な使い方を再確認します。

## `context.WithValue` の基本（再確認）

*   **`context.WithValue(parent Context, key, val any) Context`**:
    *   親 Context (`parent`) を基に、キー (`key`) と値 (`val`) を関連付けた新しい子 Context を返します。
    *   `key` は比較可能 (`comparable`) である必要があり、通常は**独自に定義した非公開の型**を使います（キー衝突を避けるため）。
    *   `val` には任意の型の値を格納できます。
*   `WithValue` を呼び出すたびに新しい Context が生成され、値は親から子へと**不変**な形で引き継がれます。

```go title="WithValue の基本的な使い方"
package main

import (
	"context"
	"fmt"
)

// キーとして使うための独自型
type contextKey string

const (
	userIDKey    contextKey = "userID"
	traceIDKey   contextKey = "traceID"
	sessionIDKey contextKey = "sessionID"
)

func main() {
	// 1. ベースとなる Context
	ctx := context.Background()
	fmt.Printf("ベース Context: %v\n", ctx)

	// 2. userID を追加
	ctx = context.WithValue(ctx, userIDKey, "user-987")
	fmt.Printf("userID 追加後: %v\n", ctx)

	// 3. traceID を追加 (前の Context を親にする)
	ctx = context.WithValue(ctx, traceIDKey, "trace-abc-123")
	fmt.Printf("traceID 追加後: %v\n", ctx)

	// 4. sessionID を追加 (さらに親にする)
	ctx = context.WithValue(ctx, sessionIDKey, "sess-xyz-789")
	fmt.Printf("sessionID 追加後: %v\n", ctx)

	// --- 値の取得 (後続のファイルで説明) ---
	// 値を取得するには ctx.Value(key) を使う
	// 例: userID := ctx.Value(userIDKey).(string)
	// 例: traceID := ctx.Value(traceIDKey).(string)
	// 例: sessionID := ctx.Value(sessionIDKey).(string)
	// 例: 존재하지 않는 키 -> nil
	// nonExistent := ctx.Value(contextKey("otherKey"))
	// fmt.Printf("存在しないキーの値: %v (nil: %t)\n", nonExistent, nonExistent == nil)
}

/* 実行結果の例 (Context の文字列表現は内部詳細であり、変わりうる):
ベース Context: context.Background
userID 追加後: context.Background.WithValue(type main.contextKey, val user-987)
traceID 追加後: context.Background.WithValue(type main.contextKey, val user-987).WithValue(type main.contextKey, val trace-abc-123)
sessionID 追加後: context.Background.WithValue(type main.contextKey, val user-987).WithValue(type main.contextKey, val trace-abc-123).WithValue(type main.contextKey, val sess-xyz-789)
*/
```

**コード解説:**

*   `context.WithValue` を呼び出すたびに、新しい Context が生成され、既存の Context をラップする形で値が追加されていきます。
*   キーには独自型 `contextKey` を使っています。

**重要な注意点（再確認）:**

*   `WithValue` は、リクエストIDや認証情報など、**オプション**で**リクエストスコープ**の情報を伝達するために使います。関数の実行に**必須**なパラメータは、通常の引数として渡すべきです。
*   キーの衝突を避けるために、キーには必ず**独自型**を使いましょう。
*   Context に格納する値は**不変**であるべきです。

次のセクションでは、`WithValue` で格納した値を `Value()` メソッドで取得する方法を詳しく見ていきます。