---
title: "Best Practice: Naming Conventions (-er)" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 4. インターフェースの命名規則を使用する
// 単一メソッドのインターフェースはしばしば -er で終わる
// 良い例
type Reader interface { Read(...) }
// 良い例
type Writer interface { Write(...) }
```