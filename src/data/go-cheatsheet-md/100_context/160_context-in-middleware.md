---
title: "Context in Middleware" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// ミドルウェアでの context
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// リクエスト context を強化
		ctx := r.Context()
		ctx = context.WithValue(ctx, "startTime", time.Now())

		// 強化された context で次のハンドラを呼び出す
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
```