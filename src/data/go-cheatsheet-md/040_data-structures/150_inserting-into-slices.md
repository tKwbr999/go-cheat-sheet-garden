---
title: "Inserting into Slices" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// インデックス i に要素を挿入
s = append(s[:i], append([]int{x}, s[i:]...)...)
// より効率的な挿入
// 末尾にゼロ値を追加
s = append(s, 0)
// 要素を右にシフト
copy(s[i+1:], s[i:])
// 新しい要素を配置
s[i] = x
```