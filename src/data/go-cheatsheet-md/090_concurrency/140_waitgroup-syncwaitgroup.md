---
title: "WaitGroup (sync.WaitGroup)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// WaitGroup - Goroutine のコレクションを待機
var wg sync.WaitGroup

// カウンターを3に設定
wg.Add(3)
go func() {
	defer wg.Done() // カウンターをデクリメント
	fmt.Println("Task 1 done")
}()
go func() {
	defer wg.Done()
	fmt.Println("Task 2 done")
}()
go func() {
	defer wg.Done()
	fmt.Println("Task 3 done")
}()

// カウンターがゼロになるまでブロック
wg.Wait()
fmt.Println("All tasks completed")
```