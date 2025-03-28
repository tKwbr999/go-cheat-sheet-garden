---
title: "MultiWriter (io.MultiWriter)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// マルチライターを作成 (複数の writer に同時に書き込む)
var buf1, buf2 bytes.Buffer
multiWriter := io.MultiWriter(&buf1, &buf2)
multiWriter.Write([]byte("data"))
fmt.Println(buf1.String()) // "data"
fmt.Println(buf2.String()) // "data"
```