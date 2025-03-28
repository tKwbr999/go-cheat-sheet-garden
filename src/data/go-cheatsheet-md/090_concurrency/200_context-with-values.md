---
title: "Context with Values" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Context 値 (リクエストスコープデータ用)
type ctxKey string
const requestIDKey ctxKey = "requestID"

ctx := context.WithValue(context.Background(), requestIDKey, "12345")

// 値を取得
value, ok := ctx.Value(requestIDKey).(string)
if ok {
  fmt.Println("Request ID:", value) // 12345
}
```