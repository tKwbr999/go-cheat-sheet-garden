---
title: "Integer Types" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 整数型
// プラットフォーム依存 (32 or 64 bit)
var i int = 42

// プラットフォーム依存 (32 or 64 bit)
var u uint = 42

// -128 to 127
var i8 int8 = 127

// -32768 to 32767
var i16 int16 = 32767
var i32 int32 = 2147483647
var i64 int64 = 9223372036854775807

// int32 のエイリアス、Unicode コードポイントを表す
var rune = 'a'
```