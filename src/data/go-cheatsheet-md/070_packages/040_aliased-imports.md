---
title: "Aliased Imports" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// エイリアス付きインポート
import (
	// f.Println()
	f "fmt"
	// m.Pi
	m "math"
)
```