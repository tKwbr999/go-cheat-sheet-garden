---
title: "Boolean Evaluation" # タイトル内のダブルクォートをエスケープ
tags: ["basic-types"]
---

```go
// 条件評価
if isTrue {
  // isTrue が true の場合に実行される
}

// 短絡評価
if isValid() && doSomething() {
  // doSomething() は isValid() が true を返す場合のみ呼び出される
}
```