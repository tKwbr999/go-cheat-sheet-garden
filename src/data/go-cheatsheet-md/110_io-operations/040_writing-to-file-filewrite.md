---
title: "Writing to File (file.Write)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ファイルへの書き込み
file, _ := os.Create("output.txt")
defer file.Close()
n, err := file.Write([]byte("Hello, Go!"))
if err != nil {
	// エラー処理
}
```