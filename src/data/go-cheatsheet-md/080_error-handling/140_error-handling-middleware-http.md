## タイトル
title: エラー処理: HTTPミドルウェアによるエラーハンドリング

## タグ
tags: ["error-handling", "error", "http", "middleware", "panic", "recover", "defer"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
)

// エラーを返すカスタムハンドラ型
type AppHandler func(http.ResponseWriter, *http.Request) error

// ServeHTTP でエラー処理ミドルウェアを実装
func (fn AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Panic Recovery
	defer func() {
		if rcv := recover(); rcv != nil {
			log.Printf("Panic: %v", rcv)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
	}()

	// ハンドラ実行とエラー処理
	err := fn(w, r)
	if err != nil {
		log.Printf("Error: %v", err)
		// errors.Is や errors.As でエラーの種類を判別し、
		// 適切な statusCode を設定する (例はデフォルト 500)
		statusCode := http.StatusInternalServerError
		http.Error(w, err.Error(), statusCode)
	}
}

// ハンドラ関数の例 (error を返す)
func handleExample(w http.ResponseWriter, r *http.Request) error {
	if r.URL.Query().Get("fail") == "true" {
		return errors.New("処理失敗") // エラーを返す
	}
	if r.URL.Query().Get("panic") == "true" {
		panic("パニック発生") // パニックを起こす
	}
	fmt.Fprintln(w, "成功")
	return nil // 成功時は nil
}

func main() {
	mux := http.NewServeMux()
	// AppHandler 型にキャストして登録
	mux.Handle("/example", AppHandler(handleExample))

	fmt.Println("Listening on :8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## 解説
```text
Webアプリ等では、各リクエストハンドラで発生するエラーや
パニックを一元的に処理し、適切なHTTPレスポンスを返したい
場合があります。これは**ミドルウェア**パターンで実装できます。

**HTTPミドルウェア:**
リクエストを受け取り、前処理・後処理を行い、
次のハンドラを呼び出すコンポーネント。
Goでは `func(http.Handler) http.Handler` や、
`ServeHTTP` メソッドを持つ型で実装されます。

**エラーハンドリングミドルウェア例:**
コード例では、`error` を返すカスタムハンドラ型 `AppHandler` を定義し、
その `ServeHTTP` メソッド内でエラー処理を行っています。

1.  **パニック回復:** `defer` と `recover` を使い、ハンドラ実行中に
    `panic` が発生してもサーバーが落ちないようにし、
    500 Internal Server Error を返します。
2.  **ハンドラが返すエラー処理:**
    *   ハンドラ関数 `fn` を実行し、戻り値の `err` をチェック。
    *   `err` が `nil` でなければエラー発生と判断。
    *   ログを出力し、`errors.Is` や `errors.As` を使って
        エラーの種類 (カスタムエラー型やセンチネルエラー) を判別し、
        適切なHTTPステータスコードを決定します。
        (例: Not Found なら 404、権限エラーなら 403 など)
    *   `http.Error(w, err.Error(), statusCode)` で
        クライアントにエラーレスポンスを返します。

**ハンドラ関数:**
`handleExample` のように、`error` を返すシグネチャで定義します。
成功時は `nil`、失敗時は適切な `error` 値を返します。
(パニックを起こすことも可能ですが、通常は避けるべきです)

**登録:**
`main` 関数で `http.Handle` を使う際、ハンドラ関数を
`AppHandler` 型にキャストして登録します。これにより、
リクエストが `AppHandler` の `ServeHTTP` (ミドルウェア) を
経由するようになります。

ミドルウェアを使うことで、エラー処理やパニック回復のような
横断的な関心事を、各ハンドラのロジックから分離できます。