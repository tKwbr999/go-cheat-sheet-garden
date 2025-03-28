---
title: "Structured Errors" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// 構造化エラー (異なるフィールドを持つ)
type FieldError struct {
  Field string
  Value interface{}
  Msg   string
}

func (f *FieldError) Error() string {
  return fmt.Sprintf("invalid value %v for field %s: %s", f.Value, f.Field, f.Msg)
}

func validateInput(input string) error {
  if len(input) < 5 {
    return &FieldError{Field: "input", Value: input, Msg: "must be at least 5 chars"}
  }
  return nil
}
```