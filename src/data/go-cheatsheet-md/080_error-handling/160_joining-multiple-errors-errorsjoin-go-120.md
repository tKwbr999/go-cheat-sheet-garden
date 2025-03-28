---
title: "Joining Multiple Errors (errors.Join, Go 1.20+)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// 複数のエラーの結合 (Go 1.20+)
import "errors"

// Join は複数のエラーを単一のエラーに結合する
func validateForm(data Form) error {
	var errs []error

	if data.Name == "" {
		errs = append(errs, errors.New("name is required"))
	}

	if data.Email == "" {
		errs = append(errs, errors.New("email is required"))
	}

	if len(errs) > 0 {
		// 単一のエラーを返す
		return errors.Join(errs...)
	}
	return nil
}
```