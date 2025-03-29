## タイトル
title: "Context パッケージ: ミドルウェアでの Context 利用"
## タグ
tags: ["context", "concurrency", "http", "middleware", "WithValue", "WithContext"]
HTTPサーバーにおけるミドルウェアは、リクエスト固有の情報（リクエストID、認証情報、トレース情報など）を Context に追加し、後続のハンドラや関数で利用できるようにするための一般的な場所です。

ミドルウェアで `context.WithValue` を使って Context に値を追加し、`r.WithContext()` で更新された Context を持つリクエストを次に渡す方法については、**「並行処理」**セクションの**「Context による値の伝達 (`context.WithValue`)」** (`090_concurrency/200_context-with-values.md`) で既に説明しました。

ここでは、その基本的なパターンを再確認します。

## ミドルウェアでの Context 値追加パターン（再確認）

1.  ミドルウェア関数 (`func(http.Handler) http.Handler`) を定義します。
2.  ミドルウェア内の `http.HandlerFunc` で、引数の `http.Request` (`r`) から `ctx := r.Context()` で現在の Context を取得します。
3.  `context.WithValue(ctx, key, value)` を使って、新しいキーと値を持つ子 Context を生成します。キーには独自型を使うことを忘れないでください。
4.  `r.WithContext(newCtx)` を使って、新しい Context を持つリクエストのコピーを作成します。
5.  `next.ServeHTTP(w, r.WithContext(newCtx))` のように、新しい Context を持つリクエストを次のハンドラ (`next`) に渡します。

```go title="ミドルウェアで Context に値を追加する例"
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// キーの型とキー
type contextKey string
const requestTimeKey contextKey = "requestTime"
const requestIDKey contextKey = "requestID" // 200_context-with-values.md の例から

// リクエスト時刻とIDを追加するミドルウェア
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		reqID := fmt.Sprintf("req-%d", startTime.UnixNano()) // 簡単なID生成

		// 元の Context を取得
		ctx := r.Context()
		// 値を追加して新しい Context を生成
		ctx = context.WithValue(ctx, requestTimeKey, startTime)
		ctx = context.WithValue(ctx, requestIDKey, reqID)

		fmt.Printf("[%s] ミドルウェア: リクエスト受信 (%s)\n", reqID, r.URL.Path)

		// 新しい Context を持つリクエストで次のハンドラを呼び出す
		next.ServeHTTP(w, r.WithContext(ctx))

		// レスポンスが返された後の処理 (例: 処理時間ログ)
		duration := time.Since(startTime)
		fmt.Printf("[%s] ミドルウェア: 処理完了 (%s, duration: %v)\n", reqID, r.URL.Path, duration)
	})
}

// Context から値を取得するハンドラ
func myHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	reqID, _ := ctx.Value(requestIDKey).(string)
	startTime, _ := ctx.Value(requestTimeKey).(time.Time)

	fmt.Printf("[%s] ハンドラ: 処理開始 (リクエスト時刻: %s)\n", reqID, startTime.Format(time.RFC3339Nano))
	time.Sleep(50 * time.Millisecond) // 処理をシミュレート
	fmt.Fprintf(w, "[%s] Hello!", reqID)
}

func main() {
	finalHandler := http.HandlerFunc(myHandler)
	// ミドルウェアでハンドラをラップ
	http.Handle("/", loggingMiddleware(finalHandler))

	fmt.Println("サーバーをポート :8080 で起動します...")
	http.ListenAndServe(":8080", nil)
}

/*
サーバー起動後、 http://localhost:8080/ にアクセスすると、
コンソールに以下のようなログが出力される (IDと時刻は実行ごとに変わる):

[req-1711644000123456789] ミドルウェア: リクエスト受信 (/)
[req-1711644000123456789] ハンドラ: 処理開始 (リクエスト時刻: 2025-03-29T01:56:00.123456789+09:00)
[req-1711644000123456789] ミドルウェア: 処理完了 (/, duration: 50.XXXms)
*/
```

**コード解説:**

*   `loggingMiddleware` は、リクエストを受け取ると `startTime` と `reqID` を生成します。
*   `context.WithValue` を2回呼び出して、これらの値を Context に追加します。
*   `r.WithContext(ctx)` で新しい Context を持つリクエストを作成し、`next.ServeHTTP` で `myHandler` に渡します。
*   `myHandler` は `r.Context().Value(...)` を使って、ミドルウェアで設定された値を取得できます。
*   `next.ServeHTTP` が完了した後（つまり `myHandler` の処理が終わった後）、ミドルウェアは処理時間を計算してログに出力します。

このようにミドルウェアで Context を活用することで、リクエスト処理全体で必要な情報を効率的に引き回すことができます。