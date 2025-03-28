---
title: "Best Practice: Define Interfaces Where Used" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 3. インターフェースを実装側ではなく、使用する側で定義する
// 良い例 (クライアントコード内):
type UserStore interface {
	GetUser(id string) (*User, error)
	SaveUser(user *User) error
}
```