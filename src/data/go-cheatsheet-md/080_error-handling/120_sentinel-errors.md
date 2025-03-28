---
title: "Sentinel Errors" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// センチネルエラー (事前定義されたエラー)
var (
	ErrNotFound     = errors.New("not found")
	ErrUnauthorized = errors.New("unauthorized")
	ErrTimeout      = errors.New("timeout")
)

// エラーチェック
err := someOperation()
if errors.Is(err, ErrNotFound) {
	// not found ケースを処理
}
```