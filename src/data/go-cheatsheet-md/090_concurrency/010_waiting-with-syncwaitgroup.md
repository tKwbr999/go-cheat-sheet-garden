---
title: "Waiting with sync.WaitGroup" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// ベストプラクティス: 同期プリミティブを使用する
var wg sync.WaitGroup

// 1つの Goroutine のカウンターを追加
wg.Add(1)
go func() {
// Goroutine 終了時にカウンターをデクリメント
  defer wg.Done()
  // 処理を実行...
}()

// カウンターがゼロになるまで待機
wg.Wait()
```