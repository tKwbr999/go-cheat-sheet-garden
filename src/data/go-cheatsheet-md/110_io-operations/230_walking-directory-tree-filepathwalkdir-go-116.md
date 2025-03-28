---
title: "Walking Directory Tree (filepath.WalkDir, Go 1.16+)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// WalkDir はより効率的 (Go 1.16+)
err := filepath.WalkDir(".", func(path string, d fs.DirEntry, err error) error {
  if err != nil {
    fmt.Printf("Error accessing path %q: %v\n", path, err)
    return err // エラーが発生したパスの処理を停止
  }
  if !d.IsDir() {
    fmt.Println("File:", path)
  }
  return nil // 次のエントリへ進む
})
if err != nil {
  fmt.Println("WalkDir error:", err)
}
```