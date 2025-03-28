---
title: "Map Operations (Add/Update/Get/Delete)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// マップ操作
// キーバリューペアを追加/更新
m["three"] = 3
// 値を取得 (キーが見つからない場合はゼロ値を返す)
value := m["one"]
// キーバリューペアを削除
delete(m, "two")
```