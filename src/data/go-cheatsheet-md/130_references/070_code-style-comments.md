---
title: "Code Style: Comments" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// コメント - ドキュメント化するものの名前で始める
// User はシステム内のユーザーを表す。
type User struct {
  // ...
}

// GetByID は ID によってユーザーを取得する。
func GetByID(id string) (*User, error) {
  // ...
}
```