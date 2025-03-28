---
title: "Function Type Declaration" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 関数は第一級の値
// 変数に代入したり、引数として渡したり、関数から返したりできる

// 関数型の宣言
type Handler func(string) error
```