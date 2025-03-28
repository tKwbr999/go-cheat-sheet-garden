---
title: "Switch without Expression" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 式なしの Switch (if-else チェーンの代替)
switch {
case x > 100:
  // x > 100 の場合のコード
case x > 10:
  // x > 10 の場合のコード
default:
  // デフォルトのコード
}
```