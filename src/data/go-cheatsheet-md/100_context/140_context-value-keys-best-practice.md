---
title: "Context Value Keys (Best Practice)" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// ベストプラクティス: キーとしてカスタム型を使用する
// パッケージ間でのキー衝突を避けるため
type contextKey string

const (
	userIDKey    contextKey = "userID"
	authTokenKey contextKey = "authToken"
)

ctx := context.WithValue(context.Background(), userIDKey, "12345")
userID, ok := ctx.Value(userIDKey).(string)

// より良い名前空間分離のためにキーとして構造体を使用する
type UserContextKey struct{}
type RequestContextKey struct{}

ctx = context.WithValue(ctx, UserContextKey{}, user)
ctx = context.WithValue(ctx, RequestContextKey{}, request)

userVal, ok := ctx.Value(UserContextKey{}).(User)
```