---
title: "Generics: Method Constraints" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// メソッド制約を持つ型パラメータ
type Stringer interface {
	String() string
}

func Join[T Stringer](values []T, sep string) string {
	result := ""
	for i, v := range values {
		if i > 0 {
			result += sep
		}
		result += v.String()
	}
	return result
}
```