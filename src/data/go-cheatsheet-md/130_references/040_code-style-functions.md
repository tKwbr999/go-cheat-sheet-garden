---
title: "Code Style: Functions" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 関数 - アンダースコアではなく MixedCaps を使用
func ConnectToDatabase(config *DatabaseConfig) (*Connection, error) {
  // ...
}
```