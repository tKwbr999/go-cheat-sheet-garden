---
title: "Explicit Numeric Conversions" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// Go は明示的な型変換が必要
var i int = 42

// int から float への変換
var f float64 = float64(i)

// float から uint への変換
var u uint = uint(f)
```