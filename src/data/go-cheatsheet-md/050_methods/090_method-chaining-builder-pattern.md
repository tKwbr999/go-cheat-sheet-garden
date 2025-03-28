---
title: "メソッド: メソッドチェーンとビルダーパターン"
tags: ["methods", "メソッドチェーン", "流暢なインターフェース", "ビルダーパターン", "デザインパターン", "net/http"]
---

メソッドチェーンは、**ビルダーパターン (Builder Pattern)** と呼ばれるデザインパターンを実装する際によく使われます。ビルダーパターンは、複雑なオブジェクトの構築プロセスをステップごとに分割し、最終的に目的のオブジェクトを生成する方法です。メソッドチェーンを使うことで、この構築プロセスを流れるように記述できます。

## ビルダーパターンとは？

*   オブジェクトの生成に必要なパラメータが多い場合や、生成プロセスが複雑な場合に有効です。
*   オブジェクトを直接生成する代わりに、「ビルダー」オブジェクトを用意します。
*   ビルダーオブジェクトのメソッドを呼び出して、オブジェクトの属性や設定を段階的に行います。
*   最後に、ビルダーオブジェクトの `Build` (または類似の名前の) メソッドを呼び出して、設定された情報に基づいて最終的なオブジェクトを生成します。

## コード例: HTTPリクエストビルダー

`net/http` パッケージを使って HTTP リクエスト (`http.Request`) を作成する例を考えてみましょう。リクエストにはメソッド (GET, POSTなど)、URL、ヘッダーなど、多くの設定項目があります。これをビルダーパターンとメソッドチェーンで実装します。

```go title="メソッドチェーンを使った HTTP リクエストビルダー"
package main

import (
	"fmt"
	"net/http" // HTTP クライアントとサーバーの実装
	"net/url"  // URL 解析用 (エラー比較のため)
)

// RequestBuilder: HTTP リクエストを構築するためのビルダー
type RequestBuilder struct {
	method  string
	url     string
	headers map[string]string
	// 他にも body などが必要に応じて追加される
}

// NewRequestBuilder: 新しい RequestBuilder を作成するコンストラクタ関数
func NewRequestBuilder() *RequestBuilder {
	return &RequestBuilder{
		headers: make(map[string]string), // ヘッダー用のマップを初期化
	}
}

// Method: HTTP メソッド (GET, POST など) を設定するメソッド
// レシーバへのポインタ (*RequestBuilder) を返すことでチェーンを可能にする
func (rb *RequestBuilder) Method(method string) *RequestBuilder {
	if rb == nil {
		return nil
	}
	rb.method = method
	return rb // レシーバ自身を返す
}

// URL: リクエスト先の URL を設定するメソッド
func (rb *RequestBuilder) URL(url string) *RequestBuilder {
	if rb == nil {
		return nil
	}
	rb.url = url
	return rb // レシーバ自身を返す
}

// Header: リクエストヘッダーを追加するメソッド
func (rb *RequestBuilder) Header(key, value string) *RequestBuilder {
	if rb == nil {
		return nil
	}
	rb.headers[key] = value // マップにヘッダーを追加
	return rb // レシーバ自身を返す
}

// Build: 設定された情報に基づいて最終的な *http.Request を生成するメソッド
// このメソッドはチェーンの最後に呼ばれるため、*RequestBuilder を返す必要はない
func (rb *RequestBuilder) Build() (*http.Request, error) {
	if rb == nil {
		return nil, fmt.Errorf("RequestBuilder が nil です")
	}
	// http.NewRequest でリクエストオブジェクトを作成 (エラーの可能性あり)
	req, err := http.NewRequest(rb.method, rb.url, nil) // Body は nil とする
	if err != nil {
		return nil, fmt.Errorf("リクエスト作成失敗: %w", err)
	}

	// 設定されたヘッダーをリクエストに追加
	for key, value := range rb.headers {
		req.Header.Add(key, value)
	}

	return req, nil // 生成されたリクエストと nil エラーを返す
}

func main() {
	fmt.Println("--- HTTPリクエストの構築 (メソッドチェーン) ---")

	// メソッドチェーンを使ってリクエストを構築
	req, err := NewRequestBuilder(). // ビルダー作成
				Method("GET").                 // メソッド設定
				URL("https://example.com/api/users"). // URL設定
				Header("Accept", "application/json"). // ヘッダー設定
				Header("User-Agent", "MyGoClient/1.0"). // 別のヘッダー設定
				Build()                       // 最終的なリクエストオブジェクト生成

	// エラーチェック
	if err != nil {
		// URL が不正な場合などのエラー処理
		if urlErr, ok := err.(*url.Error); ok {
			fmt.Printf("URL エラー: %s\n", urlErr)
		} else {
			fmt.Printf("リクエスト構築中にエラーが発生しました: %v\n", err)
		}
		return
	}

	// 成功した場合、生成されたリクエスト情報を表示
	fmt.Printf("リクエストメソッド: %s\n", req.Method)
	fmt.Printf("リクエスト URL: %s\n", req.URL)
	fmt.Println("リクエストヘッダー:")
	for key, values := range req.Header {
		for _, value := range values {
			fmt.Printf("  %s: %s\n", key, value)
		}
	}
}

/* 実行結果:
--- HTTPリクエストの構築 (メソッドチェーン) ---
リクエストメソッド: GET
リクエスト URL: https://example.com/api/users
リクエストヘッダー:
  Accept: application/json
  User-Agent: MyGoClient/1.0
*/
```

**コード解説:**

*   `RequestBuilder` 構造体は、リクエストに必要な情報（メソッド、URL、ヘッダー）を保持します。
*   `NewRequestBuilder` はビルダーのインスタンスを作成します。
*   `Method`, `URL`, `Header` メソッドは、それぞれ対応する情報をビルダー内部に設定し、**自分自身 (`rb`) へのポインタを返します**。これにより、メソッド呼び出しを `.` で繋げることができます。
*   `Build` メソッドは、ビルダーに蓄積された情報を使って `http.NewRequest` を呼び出し、最終的な `*http.Request` オブジェクトを生成します。エラーが発生する可能性もあるため、`error` も一緒に返します。
*   `main` 関数では、`NewRequestBuilder().Method(...).URL(...).Header(...).Build()` のようにメソッドチェーンを使って、リクエストの構築プロセスを流れるように記述しています。
*   最後に `Build()` の結果（リクエストオブジェクトとエラー）を受け取り、エラーチェックを行っています。

メソッドチェーンとビルダーパターンを組み合わせることで、複雑なオブジェクトの生成コードを、より宣言的で読みやすい形にすることができます。