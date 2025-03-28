---
title: "Testing with Cancellation Context" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// キャンセルのテスト
func TestWithCancelContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())

	// 短時間後にキャンセルする goroutine を開始
	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
	}()

	err := functionThatShouldObserveCancel(ctx)
	if !errors.Is(err, context.Canceled) {
		t.Errorf("Expected Canceled, got %v", err)
	}
}
```