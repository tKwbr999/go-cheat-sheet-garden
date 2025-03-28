---
title: "Methods vs Functions Comparison" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// メソッドは特定の型にバインドされた関数

// 関数アプローチ
func AreaOf(r Rectangle) float64 {
  return r.Width * r.Height
}

// メソッドアプローチ
func (r Rectangle) Area() float64 {
  return r.Width * r.Height
}

// 使用法の比較
r := Rectangle{5, 10}
// パラメータ付きの関数呼び出し
a1 := AreaOf(r)
// インスタンスに対するメソッド呼び出し
a2 := r.Area()
```