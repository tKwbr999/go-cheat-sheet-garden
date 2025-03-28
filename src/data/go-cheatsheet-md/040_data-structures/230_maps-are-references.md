---
title: "Maps are References" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// マップは参照 (配列のような値ではない)
original := map[string]int{"one": 1}
// 両方が同じマップを参照
copy := original
// 変更は両方の変数を通じて見える
copy["one"] = 99
```