---
title: "Panic/Recover Usage" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 使用例
// クラッシュする代わりに 0 とエラーを返す
result, err := SafeDivide(10, 0)
```