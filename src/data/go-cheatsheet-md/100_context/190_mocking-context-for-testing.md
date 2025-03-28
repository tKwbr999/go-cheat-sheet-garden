---
title: "Mocking Context for Testing" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// テスト用の context モックを作成 (例)
type contextMock struct {
  context.Context
  doneChannel chan struct{}
}

func newContextMock() (*contextMock, func()) {
  done := make(chan struct{})
  mock := &contextMock{
    Context:     context.Background(),
    doneChannel: done,
  }
  cancel := func() { close(done) }
  return mock, cancel
}

func (c *contextMock) Done() <-chan struct{} {
  return c.doneChannel
}

func (c *contextMock) Err() error {
  select {
  case <-c.doneChannel:
    return context.Canceled
  default:
    return nil
  }
}

// テストでの使用
func TestWithMockContext(t *testing.T) {
  mockCtx, cancelMock := newContextMock()
  defer cancelMock()

  go func() {
    time.Sleep(50 * time.Millisecond)
    cancelMock()
  }()

  err := functionThatUsesContext(mockCtx)
  if !errors.Is(err, context.Canceled) {
    t.Errorf("Expected Canceled with mock, got %v", err)
  }
}
```