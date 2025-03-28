---
title: "For-Range (Skipping Index/Value)" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// アンダースコアでインデックスまたは値をスキップ
for _, value := range collection {
  // 値のみを使用
}

// インデックスのみ
for index := range collection {
  // インデックスのみを使用
}
```