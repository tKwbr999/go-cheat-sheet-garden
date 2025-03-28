---
title: "Blank Identifier (_)" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// 未使用の変数はエラーを引き起こす
// 値を無視するには _ (ブランク識別子) を使用する
_, err := fmt.Println("Hello")
```