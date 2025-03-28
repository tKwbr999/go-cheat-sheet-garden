---
title: "Creating Errors (fmt.Errorf)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// フォーマットされたエラー (より一般的)
err2 := fmt.Errorf("process failed: %s", detail)
```