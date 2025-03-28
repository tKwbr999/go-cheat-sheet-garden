---
title: "Infinite Loop" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 無限ループ
for {
  // ループ本体
  if shouldBreak {
    break
  }
}
```