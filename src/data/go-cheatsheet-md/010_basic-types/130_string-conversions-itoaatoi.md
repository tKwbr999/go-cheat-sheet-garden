---
title: "String Conversions (Itoa/Atoi)" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 文字列変換
// int to string: "42"
s := strconv.Itoa(i)
// string to int: 42, nil
i, err := strconv.Atoi(s)
```