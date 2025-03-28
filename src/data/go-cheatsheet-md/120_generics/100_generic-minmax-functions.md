---
title: "Generic Min/Max Functions" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 3. ジェネリック Min/Max 関数
func Min[T constraints.Ordered](a, b T) T {
  if a < b {
    return a
  }
  return b
}

func Max[T constraints.Ordered](a, b T) T {
  if a > b {
    return a
  }
  return b
}
```