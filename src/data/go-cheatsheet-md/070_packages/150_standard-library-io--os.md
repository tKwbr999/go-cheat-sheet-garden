---
title: "Standard Library: io / os" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 入出力
import "io"
import "os"
file, err := os.Open("file.txt")
data, err := io.ReadAll(file)
```