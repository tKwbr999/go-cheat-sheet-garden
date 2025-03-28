---
title: "Type Switch" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 型スイッチ
switch v := s.(type) {
case Rectangle:
	fmt.Println("Rectangle with area:", v.Area())
case Circle:
	fmt.Println("Circle with radius:", v.Radius)
case nil:
	fmt.Println("nil shape")
default:
	fmt.Println("Unknown shape")
}
```