---
title: "Best Practice: Favor Composition" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 2. 継承よりもコンポジションを優先する
type Logger struct {
  // ...
}

type Server struct {
// 拡張する代わりに埋め込む
  Logger
  // ...
}
```