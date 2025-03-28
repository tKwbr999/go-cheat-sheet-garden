---
title: "Nested Structs" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// ネストされた構造体
p4 := Person{
  Name: "Charlie",
  Age: 35,
  Address: &Address{
    Street: "123 Main St",
    City: "Anytown",
  },
}
city := p4.Address.City
```