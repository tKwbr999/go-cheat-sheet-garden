---
title: "Best Practice: Avoid Overusing Empty Interface" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 5. 空インターフェースの使いすぎを避ける
// 悪い例:
func Process(data interface{}) interface{} {...}

// より良い例:
func Process(data UserData) Result {...}
```