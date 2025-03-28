---
title: "Defer Argument Evaluation" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// Defer は引数をすぐに評価するが、関数の実行は後で行う
func example() {
  i := 1
// "deferred: 1" と出力される
  defer fmt.Println("deferred:", i)
  i++
// "regular: 2" と出力される
  fmt.Println("regular:", i)
}
```