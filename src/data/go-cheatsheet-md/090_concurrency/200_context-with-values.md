## タイトル
title: 並行処理: Context による値の伝達 (`context.WithValue`)

## タグ
tags: ["concurrency", "goroutine", "context", "WithValue", "Value", "リクエストスコープ", "値伝達"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"net/http"
)

// Context キー用の独自型
type contextKey string
const requestIDKey contextKey = "requestID"

// ミドルウェア: Context にリクエストIDを追加
func addRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := "req-123" // 簡単な例
		// ★ WithValue で Context に値を追加
		ctxWithID := context.WithValue(r.Context(), requestIDKey, reqID)
		// ★ 新しい Context を持つリクエストで次を呼び出す
		next.ServeHTTP(w, r.WithContext(ctxWithID))
	})
}

// ハンドラ: Context からリクエストIDを取得
func myHandler(w http.ResponseWriter, r *http.Request) {
	// ★ r.Context() で Context を取得
	ctx := r.Context()
	// ★ Value() と型アサーションで値を取得
	reqID, ok := ctx.Value(requestIDKey).(string)
	if !ok { reqID = "unknown" }

	fmt.Printf("[%s] ハンドラ処理\n", reqID)
	fmt.Fprintf(w, "[%s] 完了", reqID)
	// processData(ctx) // 後続処理にも ctx を渡せる
}

func main() {
	handlerWithMiddleware := addRequestID(http.HandlerFunc(myHandler))
	http.Handle("/data", handlerWithMiddleware)
	fmt.Println("Listening on :8080...")
	// http.ListenAndServe(":8080", nil) // サーバー起動 (実行は省略)
}

```

## 解説
```text
`context` パッケージは、キャンセル等に加え、
**リクエストスコープの値** (リクエストID、認証情報等) を
関数呼び出し間で伝達する機能も提供します。
これは **`context.WithValue`** で実現します。

**`context.WithValue()`:**
親 Context にキー・値ペアを関連付けた新しい子 Context を生成。
`ctx := context.WithValue(parentCtx, key, value)`
*   `key`: 値のキー。衝突回避のため**独自型**推奨 (例: `type myKey string`)。
    比較可能 (`comparable`) である必要あり。
*   `value`: 関連付ける値 (`any`)。

**値の取得: `ctx.Value()`:**
`value := ctx.Value(key)`
*   キーに対応する値を `any` 型で返す (なければ `nil`)。
*   通常、**型アサーション** (`v, ok := value.(ExpectedType)`) で
    元の型に戻し、`ok` で成功を確認する。

**注意点とベストプラクティス:**
*   **キー衝突回避:** キーには独自定義の非公開型を使う。
*   **オプション情報限定:** リクエストID等、横断的・オプションな
    情報伝達に使う。必須パラメータは通常の引数で渡すべき。
    Context への何でも詰め込みは避ける。
*   **不変性:** Context に格納する値は不変 (immutable) にする。

コード例では、HTTPミドルウェア `addRequestID` がリクエストごとに
IDを生成し、`context.WithValue` でリクエストの Context に追加しています。
`myHandler` は `r.Context().Value()` と型アサーションでそのIDを取得し、
利用しています。この Context は後続の関数 (`processData`) にも
そのまま渡すことができます。

`context.WithValue` はリクエスト固有情報を安全に伝達する仕組みですが、
必須パラメータの受け渡しには使わず、適切に利用しましょう。