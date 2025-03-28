---
title: "init() Function" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// init 関数はパッケージがインポートされるときに実行される
// main() が開始する前に
func init() {
  PackageVar = 42
  // 初期化コード
}
```