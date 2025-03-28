---
title: "Method Definition (Struct)" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// 型を定義
type Rectangle struct {
  Width, Height float64
}

// 値レシーバを持つメソッド
func (r Rectangle) Area() float64 {
  return r.Width * r.Height
}

// 変更のためのポインタレシーバ
func (r *Rectangle) Scale(factor float64) {
  r.Width *= factor
  r.Height *= factor
}

// メソッドの使用
rect := Rectangle{10, 5}
// 50
area := rect.Area()
// Width=20, Height=10
rect.Scale(2)
```