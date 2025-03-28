---
title: "CSV Reader (encoding/csv)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

writer の連鎖 (例: エンコードして圧縮)
targetWriter は io.Writer (例: os.File, bytes.Buffer)
var targetWriter io.Writer
compressed := gzip.NewWriter(targetWriter)
defer compressed.Close()
encoder := json.NewEncoder(compressed)
err := encoder.Encode(sourceData)
compressed.Flush() // gzip writer のフラッシュも忘れずに

```go
// CSV reader の例
csvString := `"Header 1","Header 2"
"Value 1","Value 2"
`
csvReader := csv.NewReader(strings.NewReader(csvString))
records, err := csvReader.ReadAll()
if err != nil { /* エラー処理 */ }
fmt.Println(records) // [[Header 1 Header 2] [Value 1 Value 2]]
```