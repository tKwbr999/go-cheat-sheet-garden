---
title: "iota for Enumeration" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// iota - 列挙型ジェネレータ
const (
// 1
  Monday = iota + 1
// 2
  Tuesday
// 3
  Wednesday
)
```