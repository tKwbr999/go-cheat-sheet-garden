---
title: "Functions Returning Errors" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// エラーを返す関数
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	// nil はエラーがないことを示す
	return a / b, nil
}
```