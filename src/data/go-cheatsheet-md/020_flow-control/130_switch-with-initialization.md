---
title: "Switch with Initialization" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 初期化ステートメント付きの Switch
switch os := runtime.GOOS; os {
case "darwin":
	fmt.Println("OS X")
case "linux":
	fmt.Println("Linux")
default:
	fmt.Printf("%s\n", os)
}
```