---
title: "If with Error Check" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// エラーチェック付きの If (一般的なパターン)
if err := doSomething(); err != nil {
	// エラーを処理する
	return err
}
```