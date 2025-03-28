---
title: "Closure State" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 異なるインスタンスは異なる状態を持つ
pos1 := adder()
pos2 := adder()
// 10
fmt.Println(pos1(10))
// 20
fmt.Println(pos2(20))
// 50
fmt.Println(pos1(40))
```