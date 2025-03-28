---
title: "エラー処理: HTTPミドルウェアによるエラーハンドリング"
tags: ["error-handling", "error", "http", "middleware", "panic", "recover", "defer"]
---

WebアプリケーションやAPIサーバーを開発する際、各リクエストハンドラで発生する可能性のあるエラー（`error` 値や `panic`）を一元的に処理し、適切なHTTPレスポンス（エラーページやJSONエラーレスポンス）を返したい場合があります。このような共通処理は**ミドルウェア (Middleware)** パターンを使って実装するのが一般的です。

## HTTPミドルウェアとは？

ミドルウェアは、HTTPリクエストを受け取り、何らかの前処理（認証、ロギングなど）を行い、次のハンドラ（別のミドルウェアまたは実際のリクエストハンドラ）に処理を引き渡し、そして次のハンドラからのレスポンスに対して後処理（エラー処理、レスポンスヘッダの追加など）を行うコンポーネントです。

Goの標準的な `net/http` では、ミドルウェアは通常 `func(http.Handler) http.Handler` というシグネチャを持つ関数として実装されます。これは、`http.Handler` を受け取り、新しい `http.Handler` を返す関数です。返されたハンドラの中で、受け取ったハンドラの `ServeHTTP` メソッドを呼び出すことで、処理を連鎖させます。

## エラーハンドリングミドルウェアの例

ここでは、2種類のエラー処理を行うミドルウェアの例を示します。

1.  **パニックからの回復:** ハンドラ内で `panic` が発生した場合にそれを `recover` し、500 Internal Server Error を返す。
2.  **ハンドラが返すエラーの処理:** ハンドラ関数が `error` を返すようなカスタムシグネチャを持つ場合に、そのエラーを受け取り、エラーの種類に応じて適切なHTTPステータスコードとメッセージを返す。

```go title="エラーハンドリングミドルウェアの例"
package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
)

// --- カスタムハンドラ型 (エラーを返す) ---
// 通常の http.HandlerFunc はエラーを返せないため、エラーを返せる独自の型を定義
type AppHandler func(http.ResponseWriter, *http.Request) error

// ServeHTTP メソッドを実装することで、AppHandler を http.Handler として扱えるようにする
// このメソッド内でエラー処理を行う
func (fn AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// ★ パニックからの回復 (defer + recover) ★
	defer func() {
		if rcv := recover(); rcv != nil {
			// panic が発生した場合
			log.Printf("Panic recovered: %v", rcv)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
	}()

	// カスタムハンドラ関数を実行
	err := fn(w, r)

	// ★ ハンドラが返したエラーの処理 ★
	if err != nil {
		log.Printf("Handler error: %v", err)

		// エラーの種類に応じてステータスコードを決定 (例)
		var httpErr *HTTPError // カスタムエラー型 (後述)
		statusCode := http.StatusInternalServerError // デフォルトは 500

		if errors.As(err, &httpErr) {
			// カスタムエラー型なら、そのコードを使用
			statusCode = httpErr.StatusCode
		} else if errors.Is(err, ErrNotFound) { // センチネルエラーの例
			statusCode = http.StatusNotFound
		} // 他のエラータイプも同様にチェック可能...

		// http.Error でエラーレスポンスを返す
		http.Error(w, err.Error(), statusCode)
	}
}

// --- カスタムエラー型 (HTTPステータスコードを持つ) ---
type HTTPError struct {
	StatusCode int
	Message    string
}

func (e *HTTPError) Error() string {
	return e.Message
}

// --- センチネルエラー (例) ---
var ErrNotFound = errors.New("リソースが見つかりません")

// --- ハンドラ関数の例 ---
func handleGetUser(w http.ResponseWriter, r *http.Request) error {
	id := r.URL.Query().Get("id")
	if id == "1" {
		fmt.Fprintln(w, "User: Alice")
		return nil // 成功
	}
	if id == "panic" {
		panic("意図的なパニック！") // パニックを発生させる
	}
	if id == "custom" {
		// カスタムエラーを返す
		return &HTTPError{StatusCode: http.StatusBadRequest, Message: "無効なリクエストです"}
	}
	// センチネルエラーを返す
	return ErrNotFound
}

func main() {
	mux := http.NewServeMux() // 新しい ServeMux を作成

	// AppHandler 型にキャストして登録 (ServeHTTP が呼ばれるようになる)
	mux.Handle("/user", AppHandler(handleGetUser))

	fmt.Println("サーバーをポート :8080 で起動します...")
	fmt.Println("例:")
	fmt.Println("  http://localhost:8080/user?id=1 (成功)")
	fmt.Println("  http://localhost:8080/user?id=2 (Not Found)")
	fmt.Println("  http://localhost:8080/user?id=custom (Bad Request)")
	fmt.Println("  http://localhost:8080/user?id=panic (Internal Server Error)")

	log.Fatal(http.ListenAndServe(":8080", mux))
}

/*
実行後、各URLにアクセスした場合の挙動:
- /user?id=1: "User: Alice" と 200 OK が返る
- /user?id=2: "リソースが見つかりません" と 404 Not Found が返る
- /user?id=custom: "無効なリクエストです" と 400 Bad Request が返る
- /user?id=panic: "Internal Server Error" と 500 Internal Server Error が返る (コンソールには panic のログも出る)
*/
```

**コード解説:**

1.  **`AppHandler` 型:** `error` を返すことができるカスタムハンドラ関数型を定義します。
2.  **`ServeHTTP` メソッド:** `AppHandler` 型に `ServeHTTP` メソッドを実装します。これにより、`AppHandler` は標準の `http.Handler` インターフェースを満たし、`http.ListenAndServe` などで使えるようになります。このメソッドがミドルウェアの役割を果たします。
3.  **パニック回復:** `ServeHTTP` 内の `defer func() { ... recover() ... }()` で、ハンドラ関数 `fn` の実行中に発生した `panic` を捕捉します。捕捉した場合、ログを出力し、クライアントには 500 Internal Server Error を返します。これにより、一部のリクエストで `panic` が起きてもサーバー全体が停止するのを防ぎます。
4.  **エラー処理:** ハンドラ関数 `fn` を実行し、返された `error` をチェックします (`err := fn(w, r); if err != nil { ... }`)。
5.  **エラーに応じたレスポンス:** `errors.As` や `errors.Is` を使ってエラーの種類を判別し、適切なHTTPステータスコードを決定して `http.Error` でクライアントに返します。`http.Error` は指定されたステータスコードとエラーメッセージ（`err.Error()` の結果）を含むレスポンスを書き込みます。
6.  **ハンドラ関数 (`handleGetUser`):** 処理内容に応じて、成功時は `nil` を、失敗時は `ErrNotFound`（センチネルエラー）や `*HTTPError`（カスタムエラー）を返したり、`panic` を起こしたりします。
7.  **`main` 関数:** `http.NewServeMux()` でルーターを作成し、`mux.Handle("/user", AppHandler(handleGetUser))` で `handleGetUser` を `AppHandler` 型にキャストして登録します。これにより、`/user` へのリクエストは `AppHandler` の `ServeHTTP` メソッド（エラーハンドリングミドルウェア）を通じて処理されるようになります。

このようにミドルウェアパターンを使うことで、各ハンドラ関数は自身のロジックとエラー生成に集中でき、エラーレスポンスの形式やパニックからの回復といった横断的な関心事をミドルウェアで一元的に扱うことができます。