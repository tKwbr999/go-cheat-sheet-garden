---
title: "Basic Error Handling" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// エラー処理
result, err := divide(10, 2)
if err != nil {
	// エラーパス
	fmt.Println("Error:", err)
	// エラー時の早期リターンは慣用的
	return
}
// 正常系パス
fmt.Println("Result:", result)
```