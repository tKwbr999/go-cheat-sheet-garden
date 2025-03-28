---
title: "Named Return Values" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

```go
// 名前付き戻り値
func split(sum int) (x, y int) {
  x = sum * 4 / 9
  y = sum - x
// naked return は名前付き戻り値を使用する
  return
}
```