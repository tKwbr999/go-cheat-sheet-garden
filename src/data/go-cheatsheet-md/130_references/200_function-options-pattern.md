---
title: "Function Options Pattern" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 関数オプションパターン
type ServerOption func(*Server)

func WithTimeout(timeout time.Duration) ServerOption {
  return func(s *Server) {
    s.timeout = timeout
  }
}

func WithTLS(cert, key string) ServerOption {
  return func(s *Server) {
    s.useTLS = true
    s.cert = cert
    s.key = key
  }
}

func NewServer(addr string, opts ...ServerOption) *Server {
  // デフォルト設定
  server := &Server{
    addr:    addr,
    timeout: 30 * time.Second,
  }
  
  // オプションを適用
  for _, opt := range opts {
    opt(server)
  }
  
  return server
}

// 使用法
server := NewServer(":8080",
  WithTimeout(10*time.Second),
  WithTLS("cert.pem", "key.pem"),
)
```