---
title: "Variable Initialization" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// 変数の初期化
var (
  home = os.Getenv("HOME")
  user = os.Getenv("USER")
)
```