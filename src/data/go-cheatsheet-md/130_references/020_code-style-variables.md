---
title: "Code Style: Variables" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 変数 - 短く、説明的な名前を使用
// 読みやすさのために宣言をグループ化
var (
  userCount int
  maxRetries = 3
// エラー変数: err + 説明
  errNotFound = errors.New("not found")
)
```