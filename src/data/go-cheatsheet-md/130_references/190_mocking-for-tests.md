---
title: "Mocking for Tests" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// モック
type mockUserStore struct {
  users map[string]*User
}

func (m *mockUserStore) GetUser(id string) (*User, error) {
  user, ok := m.users[id]
  if !ok {
    return nil, errors.New("user not found")
  }
  return user, nil
}

// モックを使用したテスト
func TestHandler_GetUser(t *testing.T) {
  // モックを設定
  store := &mockUserStore{
    users: map[string]*User{
      "123": {ID: "123", Name: "Test User"},
    },
  }
  
  // モックを注入
  handler := NewUserHandler(store)
  
  // テスト
  user, err := handler.GetUser("123")
  if err != nil {
    t.Fatalf("expected no error, got %v", err)
  }
  if user.Name != "Test User" {
    t.Errorf("expected name 'Test User', got '%s'", user.Name)
  }
}
```