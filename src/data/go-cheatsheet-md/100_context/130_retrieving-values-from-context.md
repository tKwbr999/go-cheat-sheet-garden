---
title: "Retrieving Values from Context" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// 値の取得
userID, ok := ctx.Value("userID").(string)
if !ok {
	fmt.Println("UserID not found or not a string")
} else {
	fmt.Println("UserID:", userID)
}
```