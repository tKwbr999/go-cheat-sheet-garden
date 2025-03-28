---
title: "Best Practice: Use Interfaces for DI" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 3. 依存性注入にインターフェースを使用する
type UserStore interface {
	GetUser(id string) (*User, error)
}

func NewUserHandler(store UserStore) *UserHandler {
	return &UserHandler{store: store}
}
```