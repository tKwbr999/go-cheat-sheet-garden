---
title: "Copying Slices" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// コピー
dst := make([]int, len(src))
// src から dst へコピー、コピーされた要素数を返す
copy(dst, src)
```