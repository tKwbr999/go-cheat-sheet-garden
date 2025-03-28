---
title: "Method Expression (Pointer Receiver)" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// ポインタレシーバのメソッド式
type Counter int

func (c *Counter) Increment() { *c++ }

// func(*Counter)
increment := (*Counter).Increment
c := Counter(0)
// (&c).Increment() と同じ
increment(&c)
```