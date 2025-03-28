---
title: "Seeking in File (file.Seek)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ファイル内でのシーク
file, _ := os.Open("filename.txt")
defer file.Close()
// 開始位置から10バイト目にシーク
newPos, err := file.Seek(10, io.SeekStart)
if err != nil {
  // エラー処理
}
// 現在位置から5バイト戻る
newPos, err = file.Seek(-5, io.SeekCurrent)
// 末尾から20バイト前にシーク
newPos, err = file.Seek(-20, io.SeekEnd)
```