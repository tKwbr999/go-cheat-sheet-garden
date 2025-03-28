---
title: "String/Byte Slice Conversions" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// その他の文字列変換
// string から byte スライスへ
b := []byte("hello")
// byte スライスから string へ
s := string(b)
```