---
title: "Best Practice: Accept Interfaces, Return Structs" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 2. インターフェースを受け入れ、具体的な型を返す
// 良い例:
func processData(r Reader) *Result {
  // 任意の Reader からデータを処理
  return &Result{...}
}
```