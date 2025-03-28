---
title: "Appending to Slices" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// スライスに追加 (必要に応じて新しい基底配列を作成することがある)
// 要素 4 と 5 を追加
s = append(s, 4, 5)
t := []int{6, 7, 8}
// 別のスライスを追加
s = append(s, t...)
```