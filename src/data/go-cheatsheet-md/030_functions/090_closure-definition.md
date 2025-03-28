---
title: "Closure Definition" # タイトル内のダブルクォートをエスケープ
tags: ["functions"]
---

便利な標準ライブラリの例:
fmt.Printf(format string, a ...interface{})
log.Printf(format string, a ...interface{})
errors.Join(errs ...error) error

```go
// 関数を返す関数 (クロージャ)
func adder() func(int) int {
	// この変数は「キャプチャされる」
	sum := 0
	return func(x int) int {
		// キャプチャされた変数を変更する
		sum += x
		return sum
	}
}
```