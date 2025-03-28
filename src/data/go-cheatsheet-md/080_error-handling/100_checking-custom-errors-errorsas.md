---
title: "Checking Custom Errors (errors.As)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// errors.As (Go 1.13+) を使用した型チェック
err := doSomething()
var myErr *MyError
if errors.As(err, &myErr) {
  fmt.Println("Code:", myErr.Code)
}
```