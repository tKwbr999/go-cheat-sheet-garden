---
title: "Blank Imports (Side Effects)" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// ブランクインポート (副作用のためだけに使用)
// PNG デコーダを登録するが、直接は使用しない
import _ "image/png"

// プロファイリングハンドラを登録
import _ "net/http/pprof"
```