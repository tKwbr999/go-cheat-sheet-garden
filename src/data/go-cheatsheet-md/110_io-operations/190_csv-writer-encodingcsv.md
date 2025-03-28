---
title: "CSV Writer (encoding/csv)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// CSV writer の例
var buf bytes.Buffer
csvWriter := csv.NewWriter(&buf)
records := [][]string{
    {"Header 1", "Header 2"},
    {"Value 1", "Value 2"},
}
err := csvWriter.WriteAll(records)
if err != nil { /* エラー処理 */ }
csvWriter.Flush() // バッファをフラッシュ
fmt.Println(buf.String())
```