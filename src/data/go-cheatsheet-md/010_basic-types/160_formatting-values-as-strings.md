---
title: "Formatting Values as Strings" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 値を文字列としてフォーマット
// "true"
s := strconv.FormatBool(true)
// "3.14" (2 decimal places)
s := strconv.FormatFloat(3.14, 'f', 2, 64)
// "-42" (base 10)
s := strconv.FormatInt(-42, 10)
```