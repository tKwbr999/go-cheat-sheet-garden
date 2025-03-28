---
title: "Context with Deadline" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// デッドライン付き Context - 特定の時間にキャンセルされる
deadline := time.Now().Add(30 * time.Second)
ctxDeadline, cancelDeadline := context.WithDeadline(context.Background(), deadline)
defer cancelDeadline()
```