---
title: "Best Practice: Handle Errors Explicitly" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 1. エラーを明示的に処理する
if err := doSomething(); err != nil {
  // エラーを処理し、無視しない
  log.Printf("error: %v", err)
  return err
}
```