---
title: "Basic String Operations" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 文字列操作
s := "hello"
// 長さ: 5 (bytes, not runes)
len := len(s)
// byte: 101 ('e')
char := s[1]
// "el"
substr := s[1:3]
```