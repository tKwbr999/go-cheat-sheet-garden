---
title: "標準ライブラリ: `net/http` パッケージ (HTTPクライアント & サーバー)"
tags: ["packages", "standard library", "net/http", "http", "web", "サーバー", "クライアント", "HandleFunc", "ListenAndServe", "ResponseWriter", "Request", "Get", "Post"]
---

Go言語の標準ライブラリ **`net/http`** パッケージは、HTTPクライアントとサーバーを実装するための強力で包括的な機能を提供します。Webアプリケーション、APIサーバー、または外部APIを利用するクライアントなどを開発する際に中心的な役割を果たします。

`import "net/http"` として利用します。

## 簡単な HTTP サーバー

Goでは非常に簡単に基本的なHTTPサーバーを起動できます。

1.  **ハンドラ関数 (Handler Function) の定義:** 特定のURLパスへのリクエストを処理する関数を定義します。ハンドラ関数は `func(http.ResponseWriter, *http.Request)` というシグネチャを持つ必要があります。
    *   `http.ResponseWriter`: クライアントへのレスポンス（ステータスコード、ヘッダー、ボディなど）を書き込むためのインターフェース。
    *   `*http.Request`: 受信したHTTPリクエストに関する情報（URL、メソッド、ヘッダー、ボディなど）を持つ構造体へのポインタ。
2.  **ハンドラの登録:** `http.HandleFunc(パスパターン, ハンドラ関数)` を使って、特定のURLパスパターンにハンドラ関数を関連付けます。
3.  **サーバーの起動:** `http.ListenAndServe(アドレス, ハンドラ)` を呼び出して、指定したアドレス（例: `:8080`）でHTTPリクエストの待ち受けを開始します。第二引数のハンドラに `nil` を渡すと、デフォルトのServeMux（`HandleFunc` で登録したハンドラを使うもの）が使用されます。`ListenAndServe` は通常、プログラムをブロックし、エラーが発生しない限り戻りません。

```go title="簡単な HTTP サーバーの例"
package main

import (
	"fmt"
	"log"      // エラーログ出力用
	"net/http" // HTTP パッケージ
	"time"
)

// --- ハンドラ関数の定義 ---

// ルートパス ("/") へのリクエストを処理するハンドラ
func rootHandler(w http.ResponseWriter, r *http.Request) {
	// URL パスが "/" 以外なら 404 Not Found を返す
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "Welcome to the home page!") // レスポンスボディに書き込み
}

// "/hello" パスへのリクエストを処理するハンドラ
func helloHandler(w http.ResponseWriter, r *http.Request) {
	// リクエストメソッドが GET でなければ 405 Method Not Allowed を返す (例)
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// クエリパラメータ "name" を取得 (例: /hello?name=Gopher)
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "World"
	}
	fmt.Fprintf(w, "Hello, %s!", name) // レスポンスボディに書き込み
}

// "/time" パスへのリクエストを処理するハンドラ
func timeHandler(w http.ResponseWriter, r *http.Request) {
	// レスポンスヘッダーを設定 (例: Content-Type)
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	// ステータスコードを 200 OK に設定 (デフォルト)
	w.WriteHeader(http.StatusOK)
	// 現在時刻をレスポンスボディに書き込み
	fmt.Fprintf(w, "現在の時刻: %s", time.Now().Format(time.RFC3339))
}

func main() {
	// --- ハンドラの登録 ---
	http.HandleFunc("/", rootHandler)       // "/" パスに rootHandler を登録
	http.HandleFunc("/hello", helloHandler) // "/hello" パスに helloHandler を登録
	http.HandleFunc("/time", timeHandler)   // "/time" パスに timeHandler を登録

	// --- サーバーの起動 ---
	port := ":8080" // 待ち受けポート
	fmt.Printf("サーバーをポート %s で起動します...\n", port)
	fmt.Printf("ブラウザで http://localhost%s などにアクセスしてください。\n", port)

	// ListenAndServe でサーバーを開始 (エラーが発生するまでブロック)
	// エラーが発生した場合 (例: ポートが使用中)、ログに出力して終了
	log.Fatal(http.ListenAndServe(port, nil))
}

/*
実行後、Webブラウザや curl などで以下のURLにアクセスしてみてください。
- http://localhost:8080/
- http://localhost:8080/hello
- http://localhost:8080/hello?name=Go
- http://localhost:8080/time
- http://localhost:8080/unknown (404 Not Found になるはず)
*/
```

## 簡単な HTTP クライアント

`net/http` パッケージは、HTTPリクエストを送信するためのクライアント機能も提供します。

*   **`http.Get(url string) (*Response, error)`**: 指定したURLにGETリクエストを送信します。レスポンス (`*http.Response`) とエラーを返します。レスポンスボディは `resp.Body` (これは `io.ReadCloser`) から読み取る必要があり、**使い終わったら必ず `resp.Body.Close()` を呼び出す**必要があります (`defer` を使うのが一般的)。
*   **`http.Post(url, contentType string, body io.Reader) (*Response, error)`**: 指定したURLにPOSTリクエストを送信します。`contentType` (例: `"application/json"`) とリクエストボディ (`io.Reader`) を指定します。
*   **`http.NewRequest(method, url string, body io.Reader)`**: より詳細なリクエスト（ヘッダーの設定など）を作成する場合に使います。
*   **`http.DefaultClient.Do(req *Request) (*Response, error)`**: 作成したリクエスト (`*http.Request`) を送信します。

```go title="簡単な HTTP GET クライアントの例"
package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	url := "https://example.com" // 取得したい URL
	fmt.Printf("'%s' に GET リクエストを送信します...\n", url)

	// http.Get で GET リクエストを送信
	resp, err := http.Get(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "GET リクエストエラー: %v\n", err)
		return
	}
	// ★★★ 重要: レスポンスボディは必ず閉じる ★★★
	defer resp.Body.Close()

	fmt.Printf("レスポンスステータス: %s\n", resp.Status) // 例: "200 OK"

	// レスポンスボディを読み取る
	// io.ReadAll は io.Reader を受け取る (resp.Body は io.ReadCloser なので OK)
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "レスポンスボディ読み取りエラー: %v\n", err)
		return
	}

	// 最初の数百バイトだけ表示 (例)
	fmt.Println("\nレスポンスボディ (最初の部分):")
	limit := 300
	if len(bodyBytes) < limit {
		limit = len(bodyBytes)
	}
	fmt.Println(string(bodyBytes[:limit]))
}

/* 実行結果 (example.com の内容によって変わります):
'https://example.com' に GET リクエストを送信します...
レスポンスステータス: 200 OK

レスポンスボディ (最初の部分):
<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family
*/
```

`net/http` パッケージは非常に高機能であり、ここで紹介したのは基本的な部分だけです。HTTPS、カスタムヘッダー、Cookie、リダイレクト処理、より詳細なサーバー設定（`http.Server`）など、Web開発に必要な多くの機能を提供しています。