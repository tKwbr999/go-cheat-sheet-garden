---
title: "Method Expression" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// メソッド式はメソッドを通常の関数に変換する
type Point struct{ X, Y float64 }

func (p Point) Distance(q Point) float64 {
  return math.Hypot(q.X-p.X, q.Y-p.Y)
}

// メソッド式 - 最初のパラメータとして明示的なレシーバ
// func(Point, Point) float64
distance := Point.Distance
p := Point{1, 2}
q := Point{4, 6}
// p.Distance(q) と同じ
fmt.Println(distance(p, q))
```