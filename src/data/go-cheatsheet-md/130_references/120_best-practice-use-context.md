---
title: "Best Practice: Use Context" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 4. キャンセルとデッドラインに context を使用する
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := service.DoWork(ctx)
```