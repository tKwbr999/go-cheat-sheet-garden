---
title: "Checking Wrapped Errors (errors.Is)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// ラップによる階層的なエラーの作成
var ErrConnRefused = errors.New("connection refused")

func connect() error {
  // 接続試行...
  return ErrConnRefused
}

func request() error {
  err := connect()
  if err != nil {
    return fmt.Errorf("request failed: %w", err)
  }
  // ...
  return nil
}

// ラップされたエラーのチェック
err := request()
if errors.Is(err, ErrConnRefused) {
  // connection refused エラーを処理
  fmt.Println("Could not connect")
}
```