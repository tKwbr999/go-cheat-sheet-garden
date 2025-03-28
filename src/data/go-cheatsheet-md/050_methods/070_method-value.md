---
title: "Method Value" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// メソッド値 (レシーバがバインドされる)
p := Point{1, 2}
// func(Point) float64
distanceFromP := p.Distance
// p.Distance(Point{4, 6}) と同じ
fmt.Println(distanceFromP(Point{4, 6}))
```