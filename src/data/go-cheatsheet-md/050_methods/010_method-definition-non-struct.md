---
title: "Method Definition (Non-Struct)" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// 構造体以外の型に対するメソッド
type MyInt int

func (m MyInt) IsEven() bool {
  return m%2 == 0
}

func (m *MyInt) Add(n MyInt) {
  *m += n
}

var num MyInt = 10
// true
fmt.Println(num.IsEven())
num.Add(5)
// 15
fmt.Println(num)
```