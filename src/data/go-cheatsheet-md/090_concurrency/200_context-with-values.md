---
title: "並行処理: Context による値の伝達 (`context.WithValue`)"
tags: ["concurrency", "goroutine", "context", "WithValue", "Value", "リクエストスコープ", "値伝達"]
---

`context` パッケージは、キャンセルシグナルやデッドラインの伝達に加えて、**リクエストスコープの値 (request-scoped values)** を関数呼び出し間で伝達する機能も提供します。これは `context.WithValue` 関数を使って実現されます。

## `context.WithValue()` の使い方

`context.WithValue()` は、親 Context にキーと値のペアを関連付けた新しい子 Context を生成します。

**構文:** `ctx := context.WithValue(parent Context, key, val any)`

*   `parent`: 親となる Context。
*   `key`: 値に関連付けるキー。通常、キーの衝突を避けるために、**独自に定義した型**（例: `type myKey string`）や、エクスポートされていない型を使います。文字列リテラルを直接使うのは避けるべきです。キーは比較可能 (`comparable`) である必要があります。
*   `val`: Context に関連付ける値。任意の型 (`any`) の値を格納できます。
*   戻り値 `ctx`: 値が関連付けられた新しい Context。

## 値の取得: `ctx.Value()`

Context に関連付けられた値を取得するには、`Value()` メソッドを使います。

**構文:** `value := ctx.Value(key)`

*   `ctx`: 値を取得したい Context。
*   `key`: 取得したい値に関連付けられたキー。`WithValue` で使ったキーと同じものを指定します。
*   戻り値 `value`: キーに対応する値が `any` 型で返されます。キーが見つからない場合や、値が `nil` の場合は `nil` が返ります。
*   **型アサーション:** `Value()` は `any` 型を返すため、通常は**型アサーション**を使って元の型に戻す必要があります。カンマOKイディオム `v, ok := value.(ExpectedType)` を使って、型アサーションが成功したかどうかを確認するのが安全です。

## 注意点とベストプラクティス

*   **キーの衝突回避:** 異なるパッケージ間でキーが衝突するのを防ぐため、キーには**独自に定義した非公開の型**を使うことが強く推奨されます。
    ```go
    // パッケージ内でキーの型を定義
    type contextKey string

    // 非公開のキー変数を定義
    const userIDKey contextKey = "userID"
    ```
*   **オプション情報の伝達に限定:** `Context` を使った値の伝達は、リクエストID、トレース情報、ユーザー認証情報など、**リクエスト処理全体に関わる横断的な情報**や、**オプションの情報**を渡すために使うべきです。関数の実行に**必須なパラメータ**は、通常の関数引数として明示的に渡すべきです。`Context` に何でも詰め込むのはアンチパターンとされています。
*   **不変性:** `Context` に格納する値は、通常、不変 (immutable) であるべきです。Goroutine 間で共有されるため、格納した値を後から変更すると競合状態を引き起こす可能性があります。

## コード例: リクエストIDの伝達

HTTPリクエストハンドラが受け取ったリクエストIDを、後続の処理関数に `Context` を使って渡す例を見てみましょう。

```go title="Context を使った値の伝達"
package main

import (
	"context"
	"fmt"
	"net/http" // HTTPサーバーの例のため
	"time"
)

// --- Context キーの定義 ---
// キーとして使うための独自型
type contextKey string

// リクエストID用のキー (非公開)
const requestIDKey contextKey = "requestID"

// --- リクエストIDを Context に追加するミドルウェア (例) ---
func addRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 簡単なリクエストIDを生成 (実際にはUUIDなどが使われる)
		reqID := fmt.Sprintf("req-%d", time.Now().UnixNano())
		// ★ WithValue でリクエストIDを Context に追加 ★
		// r.Context() はリクエストに紐づく Context を返す
		ctxWithID := context.WithValue(r.Context(), requestIDKey, reqID)
		// ★ 新しい Context を持つリクエストを作成して次のハンドラに渡す ★
		next.ServeHTTP(w, r.WithContext(ctxWithID))
	})
}

// --- Context からリクエストIDを取得して利用するハンドラ ---
func myHandler(w http.ResponseWriter, r *http.Request) {
	// ★ r.Context() でリクエストに紐づく Context を取得 ★
	ctx := r.Context()
	// ★ Value() と型アサーションでリクエストIDを取得 ★
	reqID, ok := ctx.Value(requestIDKey).(string)
	if !ok {
		// 通常はありえないが、念のためチェック
		reqID = "unknown"
	}

	fmt.Printf("[%s] ハンドラ処理開始\n", reqID)

	// 後続の処理関数に Context を渡す
	processData(ctx)

	fmt.Fprintf(w, "[%s] 処理完了\n", reqID)
}

// --- Context を受け取る後続の処理関数 (例) ---
func processData(ctx context.Context) {
	// Context からリクエストIDを取得 (再度)
	reqID, ok := ctx.Value(requestIDKey).(string)
	if !ok {
		reqID = "unknown"
	}
	fmt.Printf("[%s] データ処理中...\n", reqID)
	// ... 何らかの処理 ...
	time.Sleep(50 * time.Millisecond)
}

func main() {
	// ハンドラをミドルウェアでラップ
	handlerWithMiddleware := addRequestID(http.HandlerFunc(myHandler))

	http.Handle("/data", handlerWithMiddleware)

	fmt.Println("サーバーをポート :8080 で起動します...")
	fmt.Println("ブラウザで http://localhost:8080/data にアクセスしてください。")
	http.ListenAndServe(":8080", nil)
}

/*
サーバー起動後、 http://localhost:8080/data にアクセスすると、
コンソールに以下のようなログが出力される (リクエストIDは実行ごとに変わる):

[req-1711644000123456789] ハンドラ処理開始
[req-1711644000123456789] データ処理中...

ブラウザには以下のように表示される:
[req-1711644000123456789] 処理完了
*/
```

**コード解説:**

*   `contextKey` という独自型を定義し、それを使ってキー `requestIDKey` を定義しています。
*   `addRequestID` ミドルウェアは、リクエストごとに一意なIDを生成し、`context.WithValue` を使ってリクエストの Context (`r.Context()`) にそのIDを `requestIDKey` で関連付けます。そして、新しい Context を持つリクエスト (`r.WithContext(ctxWithID)`) を作成して次のハンドラ `next` に渡します。
*   `myHandler` は、引数 `r` から `r.Context()` で Context を取得し、`ctx.Value(requestIDKey)` と型アサーションを使ってリクエストIDを取り出します。
*   `myHandler` は、取得した Context をそのまま後続の `processData` 関数に渡します。`processData` でも同様に Context からリクエストIDを取得できます。

このように `context.WithValue` は、リクエストIDやトレース情報など、リクエストのライフサイクル全体で共有したい情報を、関数呼び出しの連鎖を通じて安全に伝達するための仕組みを提供します。ただし、乱用は避け、必須パラメータは明示的な引数で渡すように心がけましょう。