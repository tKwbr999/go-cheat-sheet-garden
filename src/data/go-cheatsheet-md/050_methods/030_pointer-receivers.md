---
title: "Pointer Receivers" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// ポインタレシーバ (元を変更)
func (r *Rectangle) Resize(w, h float64) {
	r.Width = w
	r.Height = h
}

// ポインタレシーバを使用する場合:
// - メソッドがレシーバを変更する
// - レシーバが大きい (コピーを避けるため)
// - 型の他のメソッドとの一貫性
// - レシーバが nil である可能性がある
```