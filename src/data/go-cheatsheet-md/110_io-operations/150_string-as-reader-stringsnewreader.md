---
title: "String as Reader (strings.NewReader)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// Reader としての文字列
strReader := strings.NewReader("This is a string reader.")
data, _ := io.ReadAll(strReader)
fmt.Println(string(data))
```