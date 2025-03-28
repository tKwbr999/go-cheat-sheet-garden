---
title: "Checking Map Key Existence" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// 存在確認
// キーが見つからない場合 value=0, exists=false
value, exists := m["four"]
if exists {
	// キーが存在する
}
```