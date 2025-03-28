---
title: "Relative Imports (Go Modules)" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 相対インポート (go modules 内)
import (
// 標準インポート
  "example.com/project/pkg/util"
// modules では無効
//  "./mylocal"
)
```