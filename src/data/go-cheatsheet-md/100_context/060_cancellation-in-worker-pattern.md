---
title: "Cancellation in Worker Pattern" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// ワーカーでの典型的な使用法
func worker(ctx context.Context, tasks <-chan Task) {
	for {
		select {
		case task, ok := <-tasks:
			if !ok {
				// チャネルが閉じられた
				return
			}
			process(ctx, task)
		case <-ctx.Done():
			fmt.Println("Worker stopping:", ctx.Err())
			return
		}
	}
}
```