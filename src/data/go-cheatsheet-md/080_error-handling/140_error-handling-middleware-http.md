---
title: "Error Handling Middleware (HTTP)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// エラー処理ミドルウェア (HTTP サーバー用)
func errorHandler(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    defer func() {
      if r := recover(); r != nil {
        log.Printf("panic: %v", r)
        http.Error(w, "internal server error", http.StatusInternalServerError)
      }
    }()
    // ここでハンドラからのエラーをキャッチすることもできる
    // err := next.ServeHTTP(w, r) // ServeHTTP はエラーを返さないが、カスタムハンドラは返すかもしれない
    next.ServeHTTP(w, r)
  })
}
```