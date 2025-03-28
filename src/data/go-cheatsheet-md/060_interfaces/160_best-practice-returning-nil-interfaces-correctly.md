---
title: "Best Practice: Returning Nil Interfaces Correctly" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 6. nil インターフェース値を正しく返す
// 不正解 (nil でないインターフェースを返す):
func getData() io.Reader {
  var p *bytes.Buffer = nil
// nil 値を持つ nil でないインターフェースを返す
  return p
}

// 正解:
func getData() io.Reader {
// nil インターフェースを返す
  return nil
}
```