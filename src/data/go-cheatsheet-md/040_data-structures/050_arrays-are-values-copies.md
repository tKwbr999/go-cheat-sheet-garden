---
title: "Arrays are Values (Copies)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 配列は値 (コピー)
original := [3]int{1, 2, 3}
// 完全なコピーを作成
copy := original
// 元の配列には影響しない
copy[0] = 99

// 配列のサイズは型の一部 - これらは異なる型
var a1 [5]int
var a2 [10]int
// a1 = a2  // コンパイルエラー - 異なる型
```