---
title: "Unexported Identifiers (camelCase)" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// エクスポートされない識別子には camelCase (パッケージ内プライベート)
type httpClient struct{}
func writeLog() {}
var maxRetries int
```