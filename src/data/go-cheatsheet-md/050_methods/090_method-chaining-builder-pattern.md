## タイトル
title: メソッド: メソッドチェーンとビルダーパターン

## タグ
tags: ["methods", "メソッドチェーン", "流暢なインターフェース", "ビルダーパターン", "デザインパターン", "net/http"]

## コード
```go
package main

import (
	"fmt"
	"net/http"
	"net/url"
)

// HTTPリクエストビルダー
type RequestBuilder struct {
	method  string
	url     string
	headers map[string]string
}

// Method設定 (レシーバを返しチェーン可能)
func (rb *RequestBuilder) Method(method string) *RequestBuilder {
	if rb == nil { return nil }
	rb.method = method
	return rb
}

// URL設定 (レシーバを返しチェーン可能)
func (rb *RequestBuilder) URL(url string) *RequestBuilder {
	if rb == nil { return nil }
	rb.url = url
	return rb
}
// Header設定メソッド (同様に *RequestBuilder を返す)
func (rb *RequestBuilder) Header(key, value string) *RequestBuilder {
	if rb == nil { return nil }
	if rb.headers == nil { rb.headers = make(map[string]string) }
	rb.headers[key] = value
	return rb
}


// Buildメソッド (最終オブジェクト生成)
func (rb *RequestBuilder) Build() (*http.Request, error) {
	if rb == nil { return nil, fmt.Errorf("nil builder") }
	req, err := http.NewRequest(rb.method, rb.url, nil) // Body は nil
	if err != nil { return nil, fmt.Errorf("request error: %w", err) }
	for key, value := range rb.headers {
		req.Header.Add(key, value)
	}
	return req, nil
}

func main() {
	// メソッドチェーンでリクエスト構築
	req, err := (&RequestBuilder{}). // 初期化 (または New 関数を使う)
				Method("GET").
				URL("https://example.com/api").
				Header("Accept", "application/json").
				Build()

	if err != nil { fmt.Printf("エラー: %v\n", err); return }

	fmt.Printf("Method: %s, URL: %s\n", req.Method, req.URL)
	fmt.Printf("Header: %v\n", req.Header)
}

```

## 解説
```text
メソッドチェーンは、**ビルダーパターン**という
デザインパターンを実装する際によく使われます。
ビルダーパターンは、複雑なオブジェクトの構築プロセスを
ステップごとに分割し、最終的に目的のオブジェクトを
生成する方法です。

**ビルダーパターン概要:**
1. オブジェクトを直接生成せず「ビルダー」オブジェクトを用意。
2. ビルダーのメソッドで属性や設定を段階的に行う。
3. 最後に `Build` メソッド等で最終オブジェクトを生成。

コード例は HTTP リクエスト (`http.Request`) を構築する
`RequestBuilder` です。

*   `RequestBuilder` 構造体が設定情報 (method, url, headers) を保持。
*   `Method`, `URL`, `Header` メソッドは、情報を設定し、
    **レシーバ自身 (`rb`) へのポインタを返す**ことで
    メソッドチェーンを可能にしています。
*   `Build` メソッドが、蓄積された情報から最終的な
    `*http.Request` オブジェクトを生成します。
    (エラーを返す可能性も考慮)

`main` 関数では、
`(&RequestBuilder{}).Method(...).URL(...).Header(...).Build()`
のようにメソッドチェーンを使い、リクエスト構築プロセスを
流れるように記述しています。

メソッドチェーンとビルダーパターンを組み合わせることで、
複雑なオブジェクト生成コードを、より宣言的で
読みやすい形にできます。