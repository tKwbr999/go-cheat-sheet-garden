---
title: "Code Style: Constants" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 定数 - 定数には camelCase または ALL_CAPS を使用
const (
	maxConnections = 100
	// 非常に重要な定数には ALL_CAPS
	DEFAULT_TIMEOUT = 30 * time.Second
)
```