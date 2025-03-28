---
title: "Type Assertion" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 型アサーション
// Rectangle であれば具体的な値を抽出
rect, ok := s.(Rectangle)
if ok {
	fmt.Println("It's a rectangle:", rect)
}
```