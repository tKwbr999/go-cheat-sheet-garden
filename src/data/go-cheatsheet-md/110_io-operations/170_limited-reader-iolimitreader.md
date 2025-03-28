---
title: "Limited Reader (io.LimitReader)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// reader の制限
reader := strings.NewReader("1234567890abcdef")
// 最大 10 バイト読み込む
limitReader := io.LimitReader(reader, 10)
data, _ := io.ReadAll(limitReader)
fmt.Println(string(data)) // "1234567890"
```