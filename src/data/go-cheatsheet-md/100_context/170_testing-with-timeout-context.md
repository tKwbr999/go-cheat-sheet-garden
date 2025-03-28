---
title: "Testing with Timeout Context" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// context を使用したテスト
func TestWithTimeoutContext(t *testing.T) {
  // タイムアウト付きの context を作成
  ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
  defer cancel()
  
  // context を尊重すべき関数を呼び出す
  result, err := functionThatUsesContext(ctx)
  
  // 結果を確認
  if !errors.Is(err, context.DeadlineExceeded) {
    t.Errorf("Expected DeadlineExceeded, got %v", err)
  }
}
```