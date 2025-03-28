---
title: "Strings and UTF-8/Runes" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// UTF-8 と Unicode
// UTF-8 エンコードされた文字列
s := "Hello, 世界"
// Unicode コードポイントに変換
runes := []rune(s)
for i, r := range s {
// rune とそのバイト位置を出力
  fmt.Printf("%d: %c\n", i, r)
}
```