---
title: "Creating Slices (make)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// スライスを作成
// len=5, cap=5, ゼロ値で初期化
s = make([]int, 5)
// len=3, cap=10, ゼロ値で初期化
s = make([]int, 3, 10)
```