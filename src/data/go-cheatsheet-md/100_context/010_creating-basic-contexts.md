---
title: "Creating Basic Contexts" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// Context の作成
// Background - ルート context、キャンセルされない、値なし、デッドラインなし
ctxBg := context.Background()

// TODO - Background に似ているが、特定の context を
// 使用すべきだがまだ利用できないことを示す
ctxTodo := context.TODO()
```