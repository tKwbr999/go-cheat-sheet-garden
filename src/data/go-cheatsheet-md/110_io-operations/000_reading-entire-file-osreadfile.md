---
title: "Reading Entire File (os.ReadFile)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ファイル全体を読み込む
data, err := os.ReadFile("filename.txt")
if err != nil {
  // エラー処理
}
fmt.Println(string(data))
```