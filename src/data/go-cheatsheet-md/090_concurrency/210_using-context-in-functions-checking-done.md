---
title: "Using Context in Functions (Checking Done)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// 関数での context の使用
func doWork(ctx context.Context) error {
	select {
	case <-time.After(2 * time.Second): // 作業をシミュレート
		fmt.Println("Work done")
		return nil
	case <-ctx.Done(): // context がキャンセルされたか確認
		fmt.Println("Work cancelled")
		// context.Canceled or context.DeadlineExceeded
		return ctx.Err()
	}
}
```