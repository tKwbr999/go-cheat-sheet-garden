---
title: "The error Interface" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// Error インターフェース
type error interface {
	Error() string
}
```