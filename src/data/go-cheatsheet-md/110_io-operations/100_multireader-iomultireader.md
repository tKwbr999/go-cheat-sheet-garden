---
title: "MultiReader (io.MultiReader)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// マルチリーダーを作成 (reader を連結)
r1 := strings.NewReader("first ")
r2 := strings.NewReader("second")
multiReader := io.MultiReader(r1, r2)
data, _ := io.ReadAll(multiReader)
fmt.Println(string(data)) // "first second"
```