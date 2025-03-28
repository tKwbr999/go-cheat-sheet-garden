---
title: "Mutex (sync.Mutex)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 共有データへの安全な並行アクセスのための相互排他
import "sync"

var (
  mu    sync.Mutex
  count int
)

func increment() {
// 共有データアクセス前にロック
  mu.Lock()
// アンロックが確実に行われるようにする
  defer mu.Unlock()
  count++
}

// 使用例
go increment()
go increment()
// 最終的な count は 2 になる (競合状態なし)
```