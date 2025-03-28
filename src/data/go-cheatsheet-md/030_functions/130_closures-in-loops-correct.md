---
title: "Closures in Loops (Correct)" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 正しいアプローチ: 各反復で新しい変数を作成する
funcs := make([]func(), 3)
for i := 0; i < 3; i++ {
// このスコープで新しい i を作成
  i := i
// 正しい: それぞれが自身の i を出力する
  funcs[i] = func() { fmt.Println(i) }
}
```