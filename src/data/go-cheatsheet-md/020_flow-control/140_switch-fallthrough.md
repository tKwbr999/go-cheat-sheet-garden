---
title: "Switch Fallthrough" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// Fallthrough は次の case の実行を強制する
switch n {
case 0:
	fmt.Println("zero")
	fallthrough
case 1:
	fmt.Println("one")
	// n が 0 または 1 の場合に実行される
}
```