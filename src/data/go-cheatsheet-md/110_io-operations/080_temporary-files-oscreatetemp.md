---
title: "Temporary Files (os.CreateTemp)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// 一時ファイルを作成 (Go 1.16+)
tempFile, err := os.CreateTemp("", "my-app-*.tmp")
if err != nil { /* エラー処理 */
}
defer os.Remove(tempFile.Name()) // クリーンアップ
defer tempFile.Close()
fmt.Println("Temp file:", tempFile.Name())
```