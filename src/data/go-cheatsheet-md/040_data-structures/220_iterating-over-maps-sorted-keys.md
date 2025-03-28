---
title: "Iterating Over Maps (Sorted Keys)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// すべてのキーを取得
keys := make([]string, 0, len(m))
for k := range m {
  keys = append(keys, k)
}

// 一貫した順序のためにキーをソート
sort.Strings(keys)
for _, k := range keys {
  fmt.Printf("%s: %d\n", k, m[k])
}
```