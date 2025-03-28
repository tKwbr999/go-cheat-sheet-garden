---
title: "Standard Library: strings" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 文字列
import "strings"
s := strings.ToUpper("hello")
contains := strings.Contains(s, "EL")
parts := strings.Split("a,b,c", ",")
```