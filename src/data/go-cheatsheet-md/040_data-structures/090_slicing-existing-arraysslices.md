---
title: "Slicing Existing Arrays/Slices" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 既存の配列またはスライスからのスライス
a := [5]int{1, 2, 3, 4, 5}
// s == []int{2, 3, 4}, len=3, cap=4
s := a[1:4]
```