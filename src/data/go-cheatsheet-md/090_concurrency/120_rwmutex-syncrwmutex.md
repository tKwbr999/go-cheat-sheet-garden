---
title: "RWMutex (sync.RWMutex)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 読み書き mutex (複数のリーダーまたは1つのライター)
var (
  rwmu   sync.RWMutex
  balance int
)

func readBalance() int {
// 複数の Goroutine が読み取りロックを保持できる
  rwmu.RLock()
  defer rwmu.RUnlock()
  return balance
}

func writeBalance(amount int) {
// 書き込みのための排他ロック
  rwmu.Lock()
  defer rwmu.Unlock()
  balance += amount
}
```