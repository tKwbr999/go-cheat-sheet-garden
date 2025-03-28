---
title: "Multiple Goroutines with WaitGroup" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 複数の Goroutine を作成
var wg sync.WaitGroup
for i := 0; i < 5; i++ {
	// クロージャの問題を避けるために新しい変数を作成
	i := i
	wg.Add(1)
	go func() {
		defer wg.Done()
		fmt.Println("Goroutine", i)
	}()
}
wg.Wait()
```