---
title: "Parsing Numeric Strings" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 数値文字列のパース
// string to float64
f, err := strconv.ParseFloat("3.14", 64)
// string to int64 (base 10)
i, err := strconv.ParseInt("-42", 10, 64)
// string to uint64 (base 10)
u, err := strconv.ParseUint("42", 10, 64)
```