---
title: "Checking for Timeout/Deadline Exceeded" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// タイムアウトまたはデッドライン超過の確認
if ctxTimeout.Err() == context.DeadlineExceeded {
  fmt.Println("Operation timed out or deadline exceeded")
}
```