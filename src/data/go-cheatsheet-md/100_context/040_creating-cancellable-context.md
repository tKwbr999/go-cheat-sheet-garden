---
title: "Creating Cancellable Context" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// context によるキャンセル

// キャンセル可能な context を作成
ctx, cancel := context.WithCancel(context.Background())

// リソースを解放するために常に cancel を呼び出す、通常は defer を使用
defer cancel()
```