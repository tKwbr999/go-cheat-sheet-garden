---
title: "Temporary Directories (os.MkdirTemp)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// 一時ディレクトリを作成 (Go 1.16+)
tempDir, err := os.MkdirTemp("", "my-app-*") // * はランダムな文字列に置換される
if err != nil { /* エラー処理 */ }
defer os.RemoveAll(tempDir) // クリーンアップ
fmt.Println("Temp dir:", tempDir)
```