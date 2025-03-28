---
title: "Method vs Function" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 関数は独立している
func distance(p1, p2 Point) float64 {
  return math.Sqrt(square(p2.X-p1.X) + square(p2.Y-p1.Y))
}

// メソッドは型にアタッチされる
type Point struct { X, Y float64 }

func (p Point) Distance(q Point) float64 {
  return math.Sqrt(square(q.X-p.X) + square(q.Y-p.Y))
}

// 使用法
p1 := Point{1, 2}
p2 := Point{4, 6}

// 関数呼び出し
dist1 := distance(p1, p2)

// メソッド呼び出し
dist2 := p1.Distance(p2)
```