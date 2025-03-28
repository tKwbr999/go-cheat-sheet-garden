---
title: "Wrapping Errors (%w)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// エラーのラップ (Go 1.13+) でコンテキストを追加
if err := loadConfig(filename); err != nil {
	return fmt.Errorf("config processing failed: %w", err)
}
```