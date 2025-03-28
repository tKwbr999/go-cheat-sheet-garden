---
title: "Value Receivers" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// 値レシーバ (コピー、不変操作)
func (r Rectangle) Double() Rectangle {
	return Rectangle{
		Width:  r.Width * 2,
		Height: r.Height * 2,
	}
}

// 値レシーバを使用する場合:
// - メソッドがレシーバを変更しない
// - レシーバが小さな値 (int, float64 など)
// - レシーバが慣例的に不変である
// - "nil" レシーバの処理が不要である
```