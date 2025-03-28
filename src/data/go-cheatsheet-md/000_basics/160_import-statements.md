---
title: "Import Statements" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// インポートはグループ化され、ファクタリングできる
import (
  "fmt"
  "io"
  
// サードパーティパッケージ
  "golang.org/x/net/html"
// ローカルパッケージ
  "myproject/mypackage"
)
```