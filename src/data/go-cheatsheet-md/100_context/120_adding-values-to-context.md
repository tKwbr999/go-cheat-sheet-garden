---
title: "Adding Values to Context" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// Context 値 - リクエストスコープのキーバリューペア

// context に値を追加 (新しい context を作成)
ctx := context.Background()
ctx = context.WithValue(ctx, "userID", "12345")
ctx = context.WithValue(ctx, "authToken", "token-123")
```