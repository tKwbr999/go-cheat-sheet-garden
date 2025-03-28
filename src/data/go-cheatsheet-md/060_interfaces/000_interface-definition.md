---
title: "Interface Definition" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// インターフェース定義 - メソッドシグネチャのセット
type Shape interface {
	Area() float64
	Perimeter() float64
}
```