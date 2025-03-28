---
title: "Multiple init() Functions" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 複数の init 関数は宣言順に実行される
func init() {
  // 最初の init
}

func init() {
  // 2番目の init
}
```