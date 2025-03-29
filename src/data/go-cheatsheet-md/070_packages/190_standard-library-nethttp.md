## タイトル
title: 標準ライブラリ: `net/http` パッケージ (HTTPクライアント & サーバー)

## タグ
tags: ["packages", "standard library", "net/http", "http", "web", "サーバー", "クライアント", "HandleFunc", "ListenAndServe", "ResponseWriter", "Request", "Get", "Post"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"net/http" // HTTP パッケージ
)

// ルート ("/") ハンドラ関数
func rootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprint(w, "Welcome!") // レスポンス書き込み
}

// /hello ハンドラ関数
func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello!")
}

func main() {
	// ハンドラの登録
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/hello", helloHandler)

	// サーバーの起動
	port := ":8080"
	fmt.Printf("Server listening on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil)) // エラーなら Fatal
}

```

## 解説
```text
**`net/http`** パッケージは、HTTPクライアントとサーバーを
実装するための標準ライブラリです。WebアプリやAPI開発の
中心となります。`import "net/http"` で利用します。

**簡単な HTTP サーバー:**
1.  **ハンドラ関数定義:** リクエストを処理する関数を定義。
    シグネチャ: `func(http.ResponseWriter, *http.Request)`
    *   `ResponseWriter w`: レスポンス書き込み用インターフェース。
    *   `Request *r`: 受信リクエスト情報。
2.  **ハンドラ登録:** URLパスとハンドラ関数を関連付け。
    `http.HandleFunc(パスパターン, ハンドラ関数)`
3.  **サーバー起動:** リクエストを待ち受け開始。
    `http.ListenAndServe(アドレス, ハンドラ)`
    *   `アドレス`: 例 `":8080"`。
    *   `ハンドラ`: `nil` なら `HandleFunc` で登録したものを使う
        (DefaultServeMux)。
    *   通常はプログラムをブロックする。

コード例では `/` と `/hello` にハンドラを登録し、
`:8080` でサーバーを起動しています。

**簡単な HTTP クライアント:**
リクエスト送信機能も提供します。
*   `http.Get(url)`: GETリクエスト送信。
*   `http.Post(url, contentType, body)`: POSTリクエスト送信。
*   `http.NewRequest(method, url, body)`: カスタムリクエスト作成。
*   `http.DefaultClient.Do(req)`: 作成したリクエスト送信。

**重要:** レスポンス (`*http.Response`) を受け取ったら、
必ず `resp.Body` を閉じる必要があります。
`defer resp.Body.Close()` を使うのが定石です。

`net/http` は高機能で、HTTPS、カスタムヘッダー、Cookie、
詳細なサーバー設定 (`http.Server`) など多くの機能を提供します。