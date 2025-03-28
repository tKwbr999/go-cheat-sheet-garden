---
title: "Multiple Defers (LIFO)" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 複数の defer は LIFO (後入れ先出し) 順で実行される
func ProcessFiles() {
	defer fmt.Println("1. Done processing")
	defer fmt.Println("2. Closing files")
	defer fmt.Println("3. Saving results")

	// 関数が戻るときの出力:
	// 3. Saving results
	// 2. Closing files
	// 1. Done processing
}
```