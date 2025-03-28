---
title: "Panic" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// Panic は現在の goroutine の通常の実行を停止する
// 遅延関数は依然として実行される
func divide(a, b int) int {
  if b == 0 {
// 回復されない限りプログラムをクラッシュさせる
    panic("division by zero")
  }
  return a / b
}
```