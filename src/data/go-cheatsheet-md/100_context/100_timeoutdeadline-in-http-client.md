---
title: "Timeout/Deadline in HTTP Client" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// HTTP クライアントでの使用
ctxHttp, cancelHttp := context.WithTimeout(context.Background(), 2*time.Second)
defer cancelHttp()

//example.com", nil)
req, err := http.NewRequestWithContext(ctxHttp, "GET", "https:
if err != nil {
  // エラー処理
}

resp, err := http.DefaultClient.Do(req)
if err != nil {
  // リクエストに時間がかかりすぎた場合、context.DeadlineExceeded になる可能性がある
  if errors.Is(err, context.DeadlineExceeded) {
    fmt.Println("HTTP request timed out")
  }
  // その他のエラー処理
}
if resp != nil {
  defer resp.Body.Close()
}
```