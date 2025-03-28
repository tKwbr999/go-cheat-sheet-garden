---
title: "Type Switch" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 型 switch (インターフェース用)
switch v := interface{}.(type) {
case nil:
  fmt.Println("nil 値")
case int:
  fmt.Println("整数:", v)
case string:
  fmt.Println("文字列:", v)
default:
  fmt.Printf("予期しない型: %T\n", v)
}
```