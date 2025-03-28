---
title: "Internal Packages" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// internal パッケージは、親パッケージまたは
// 兄弟パッケージからのみインポート可能

// ディレクトリ構造:
// myproject/
//   cmd/
//     app/
//       main.go  // "myproject/internal/auth" をインポート可能
//   internal/
//     auth/
//       auth.go
//   pkg/
//     public/
//       public.go  // "myproject/internal/auth" をインポート可能

// auth.go 内
package auth

func Authenticate(user, pass string) bool {
  // 実装
}

// main.go 内
package main

import "myproject/internal/auth"

func main() {
  if auth.Authenticate("user", "pass") {
    // ...
  }
}

// 外部パッケージは "myproject/internal/..." をインポートできない
// これは Go コンパイラによって強制される
```