---
title: "Once (sync.Once)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// Once - 厳密に一度だけ実行
var once sync.Once

func initialize() {
  fmt.Println("Initializing...")
  // 初期化コード
}

func getInstance() {
  once.Do(initialize) // initialize は一度だけ呼び出される
  fmt.Println("Instance ready")
}

go getInstance()
go getInstance()
```