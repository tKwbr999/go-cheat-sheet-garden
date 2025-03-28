---
title: "Method Chaining (Builder Pattern)" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// メソッドを使用したビルダーパターン
type RequestBuilder struct {
  method  string
  url     string
  headers map[string]string
}

func NewRequestBuilder() *RequestBuilder {
  return &RequestBuilder{
    headers: make(map[string]string),
  }
}

func (rb *RequestBuilder) Method(method string) *RequestBuilder {
  rb.method = method
  return rb
}

func (rb *RequestBuilder) URL(url string) *RequestBuilder {
  rb.url = url
  return rb
}

func (rb *RequestBuilder) Header(key, value string) *RequestBuilder {
  rb.headers[key] = value
  return rb
}

func (rb *RequestBuilder) Build() (*http.Request, error) {
  req, err := http.NewRequest(rb.method, rb.url, nil)
  if err != nil {
    return nil, err
  }
  
  for k, v := range rb.headers {
    req.Header.Add(k, v)
  }
  
  return req, nil
}

// 使用法
req, err := NewRequestBuilder().
  Method("GET").
//example.com").
  URL("https:
  Header("User-Agent", "MyClient/1.0").
  Build()
```