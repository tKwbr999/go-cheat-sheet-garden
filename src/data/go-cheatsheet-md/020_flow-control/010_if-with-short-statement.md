---
title: "If with Short Statement" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 短いステートメント付きの If
if value := getValue(); value > 10 {
  // value はこのスコープ内でのみ利用可能
  // かつ条件が true であった場合
}
```