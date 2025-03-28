---
title: "Empty Interface Type Assertion" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 型アサーション
str, ok := i.(string)
if ok {
	// "hello"
	fmt.Println(str)
}

// チェックなしの型アサーション (間違った型だと panic する)
// i が int でなければ panic する
n := i.(int)
```