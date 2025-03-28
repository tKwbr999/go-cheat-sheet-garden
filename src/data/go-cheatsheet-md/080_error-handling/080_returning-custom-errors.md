---
title: "Returning Custom Errors" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// カスタムエラーを返す
func doSomething() error {
  // 何らかの条件でエラー発生
  return &MyError{
    Code:    500,
    Message: "something went wrong",
  }
}
```