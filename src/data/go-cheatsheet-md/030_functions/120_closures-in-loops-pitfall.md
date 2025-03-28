---
title: "Closures in Loops (Pitfall)" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// for ループでのクロージャの使用 (よくある落とし穴)
funcs := make([]func(), 3)
for i := 0; i < 3; i++ {
// 間違い: すべて最後の i の値 (3) を出力する
  funcs[i] = func() { fmt.Println(i) }
}
```