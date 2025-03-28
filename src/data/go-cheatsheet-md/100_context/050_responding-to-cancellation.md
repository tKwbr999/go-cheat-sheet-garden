---
title: "Responding to Cancellation" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// キャンセル可能な goroutine を開始
go func(innerCtx context.Context) {
  for {
    select {
    case <-innerCtx.Done():
      // Context がキャンセルされた、処理を停止
      fmt.Println("Stopped due to cancellation")
      return
    default:
      // 何らかの処理を行う
      fmt.Println("Working...")
      time.Sleep(100 * time.Millisecond)
    }
  }
}(ctx)

// 後でキャンセルをトリガー
time.Sleep(500 * time.Millisecond)
cancel()

// context がキャンセルされたか確認
if ctx.Err() == context.Canceled {
  fmt.Println("Context was canceled")
}
```