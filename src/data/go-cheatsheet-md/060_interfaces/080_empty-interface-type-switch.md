---
title: "Empty Interface Type Switch" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 安全な型チェックのための型スイッチ
switch v := i.(type) {
case int:
	fmt.Println("int:", v)
case string:
	fmt.Println("string:", v)
case map[string]int:
	fmt.Println("map:", v["key"])
default:
	fmt.Println("unknown type")
}
```