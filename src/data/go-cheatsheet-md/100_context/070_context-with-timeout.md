---
title: "Context with Timeout" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// タイムアウト付き Context - 指定時間後に自動的にキャンセルされる
ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 2*time.Second)
// タイムアウト前に完了した場合でも、リソースを早期に解放するために cancel を呼び出す
defer cancelTimeout()
```