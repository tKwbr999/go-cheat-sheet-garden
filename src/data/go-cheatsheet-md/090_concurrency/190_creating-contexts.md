---
title: "Creating Contexts" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Context はデッドライン、キャンセルシグナル、リクエストスコープの値を運ぶ
import (
  "context"
  "time"
)

// Context の作成
// Background context (すべての context のルート)
ctxBg := context.Background()

// WithCancel - キャンセル可能な context
ctxCancel, cancelFunc := context.WithCancel(ctxBg)
defer cancelFunc() // 完了時にキャンセル

// 時間制限付き context
ctxTimeout, cancelTimeout := context.WithTimeout(ctxBg, time.Second)
defer cancelTimeout()

ctxDeadline, cancelDeadline := context.WithDeadline(ctxBg, time.Now().Add(time.Minute))
defer cancelDeadline()
```