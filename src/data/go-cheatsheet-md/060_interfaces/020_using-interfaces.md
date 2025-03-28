---
title: "Using Interfaces" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// インターフェースの使用
func printShapeInfo(s Shape) {
  fmt.Printf("Area: %f, Perimeter: %f\n", 
    s.Area(), s.Perimeter())
}

rect := Rectangle{5, 10}
// 暗黙的に Shape を満たす
printShapeInfo(rect)

circ := Circle{5}
// これも Shape を満たす
printShapeInfo(circ)
```