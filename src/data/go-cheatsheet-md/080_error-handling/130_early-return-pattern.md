---
title: "Early Return Pattern" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// 早期リターンによる反復的なチェックの回避
func process() error {
	err := step1()
	if err != nil {
		return fmt.Errorf("step1 failed: %w", err)
	}

	err = step2()
	if err != nil {
		return fmt.Errorf("step2 failed: %w", err)
	}

	return step3()
}
```