---
title: "Code Style: Error Handling" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// エラー処理 - エラーをすぐにチェック
result, err := DoSomething()
if err != nil {
  return nil, fmt.Errorf("failed to do something: %w", err)
}
```