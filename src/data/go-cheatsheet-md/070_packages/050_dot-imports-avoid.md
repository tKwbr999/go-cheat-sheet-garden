---
title: "Dot Imports (Avoid)" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// ドットインポート (非推奨)
import . "math"
// パッケージ名なしで直接アクセス
fmt.Println(Pi)
```