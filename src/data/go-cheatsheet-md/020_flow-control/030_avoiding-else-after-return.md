---
title: "Avoiding Else After Return" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// return 後の else を避ける (Go スタイル)
if condition {
  // このケースを処理する
// または break, continue
  return
}
// "else" ケースのコードはここから続く
```