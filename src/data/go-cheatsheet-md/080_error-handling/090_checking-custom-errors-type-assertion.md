---
title: "Checking Custom Errors (Type Assertion)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// 型アサーションでカスタムエラーフィールドにアクセス
if err := doSomething(); err != nil {
	if myErr, ok := err.(*MyError); ok {
		fmt.Println("Code:", myErr.Code)
	}
}
```