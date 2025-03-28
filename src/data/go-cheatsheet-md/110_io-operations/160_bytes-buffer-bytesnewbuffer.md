---
title: "Bytes Buffer (bytes.NewBuffer)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// Buffer としてのバイト (Reader および Writer)
buffer := bytes.NewBuffer([]byte("Initial data"))
// バッファに追加
buffer.WriteString(", more data")
// バイトを取得
data := buffer.Bytes()
fmt.Println(string(data)) // "Initial data, more data"
// バッファから読み込む
readData := make([]byte, 5)
buffer.Read(readData)
fmt.Println(string(readData)) // "Initi"
```