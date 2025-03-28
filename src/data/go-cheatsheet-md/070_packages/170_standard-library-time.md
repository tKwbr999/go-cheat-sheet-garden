---
title: "Standard Library: time" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 時間
import "time"
now := time.Now()
time.Sleep(time.Second * 2)
duration := time.Since(now)
```