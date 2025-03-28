---
title: "Returning Errors" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// エラーを返す (一般的なパターン)
func readConfig(path string) ([]byte, error) {
  file, err := os.Open(path)
  if err != nil {
// ゼロ値とエラーを返す
    return nil, err
  }
  defer file.Close()
  
// データと nil エラーを返す
  return io.ReadAll(file)
}
```