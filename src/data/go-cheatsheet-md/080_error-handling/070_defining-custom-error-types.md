---
title: "Defining Custom Error Types" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// カスタムエラー型を定義
type MyError struct {
	Code    int
	Message string
}

// Error インターフェースを実装
func (e *MyError) Error() string {
	return fmt.Sprintf("error %d: %s", e.Code, e.Message)
}
```