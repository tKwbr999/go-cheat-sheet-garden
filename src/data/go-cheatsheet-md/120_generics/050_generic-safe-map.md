---
title: "Generic Safe Map" # タイトル内のダブルクォートをエスケープ
tags: ["generics"]
---

```go
// 型安全なキーと値を持つジェネリックマップ
type SafeMap[K comparable, V any] struct {
  data map[K]V
  mu   sync.RWMutex
}

func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
  return &SafeMap[K, V]{
    data: make(map[K]V),
  }
}

func (m *SafeMap[K, V]) Set(key K, value V) {
  m.mu.Lock()
  defer m.mu.Unlock()
  m.data[key] = value
}

func (m *SafeMap[K, V]) Get(key K) (V, bool) {
  m.mu.RLock()
  defer m.mu.RUnlock()
  val, ok := m.data[key]
  return val, ok
}
```