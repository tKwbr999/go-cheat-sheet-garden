---
title: "Set Operations (Union, Intersection)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// セット操作
// 和集合
union := make(map[string]struct{})
for element := range set1 {
  union[element] = struct{}{}
}
for element := range set2 {
  union[element] = struct{}{}
}

// 積集合
intersection := make(map[string]struct{})
for element := range set1 {
  if _, ok := set2[element]; ok {
    intersection[element] = struct{}{}
  }
}
```