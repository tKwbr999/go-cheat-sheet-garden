---
title: "Method Constraints (Stringer)" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 型パラメータメソッドと型推論

// メソッドを持つ型制約
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

// Stringer を実装
type Person struct {
  Name string
  Age  int
}

func (p Person) String() string {
  return fmt.Sprintf("%s (%d)", p.Name, p.Age)
}

// 使用法
people := []Person{
  {"Alice", 30},
  {"Bob", 25},
}
// "Alice (30), Bob (25)"
fmt.Println(Join(people, ", "))
```