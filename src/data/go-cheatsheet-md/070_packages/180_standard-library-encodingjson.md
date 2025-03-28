---
title: "Standard Library: encoding/json" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// JSON
import "encoding/json"
type Person struct {
  Name string `json:"name"`
  Age  int    `json:"age"`
}
data, err := json.Marshal(person)
person := Person{}
err := json.Unmarshal(data, &person)
```