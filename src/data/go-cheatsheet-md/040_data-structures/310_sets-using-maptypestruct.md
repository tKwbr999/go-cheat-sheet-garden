---
title: "Sets using map[type]struct{}" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// map[string]struct{} を使用したセット (メモリ効率が良い)
set := make(map[string]struct{})

// 要素を追加
set["apple"] = struct{}{}

// メンバーシップを確認
if _, ok := set["apple"]; ok {
  // "apple" はセット内にある
}

// セット要素を反復処理
for element := range set {
  fmt.Println(element)
}
```