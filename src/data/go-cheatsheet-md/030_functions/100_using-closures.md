---
title: "Using Closures" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// クロージャの使用
pos := adder()
// 10
result := pos(10)
// 30
result = pos(20)
// 60
result = pos(30)
```