---
title: "Defer with Mutex" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 一般的な使用例: Mutex のロック/アンロック
func UpdateData(data *Data) {
  data.mu.Lock()
  defer data.mu.Unlock()
  
  // データを更新...
}
```