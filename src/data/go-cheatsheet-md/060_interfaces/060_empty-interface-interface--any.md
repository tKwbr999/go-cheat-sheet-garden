---
title: "Empty Interface (interface{} / any)" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 空インターフェース (interface{} または Go 1.18+ の any) は任意の値を保持できる
// または: var i any (Go 1.18+)
var i interface{}

// int
i = 42
// string
i = "hello"
// struct
i = struct{}{}
// map
i = map[string]int{"key": 1}
```