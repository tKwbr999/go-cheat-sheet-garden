---
title: "Sets using map[type]bool" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// Go には組み込みのセット型がない
// 代わりに map[type]bool または map[type]struct{} を使用する

// map[string]bool を使用したセット
set := make(map[string]bool)

// 要素を追加
set["apple"] = true
set["banana"] = true

// メンバーシップを確認
if set["apple"] {
	// "apple" はセット内にある
}

// 要素を削除
delete(set, "apple")
```