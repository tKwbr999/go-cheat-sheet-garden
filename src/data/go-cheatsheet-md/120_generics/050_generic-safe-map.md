## タイトル
title: スレッドセーフなジェネリックマップ

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "マップ", "map", "sync", "RWMutex", "スレッドセーフ", "comparable"]

## コード
```go
package main

import (
	"fmt"
	"sync"
)

// スレッドセーフなジェネリックマップ
// K は比較可能 (comparable), V は任意 (any)
type SafeMap[K comparable, V any] struct {
	data map[K]V
	mu   sync.RWMutex // 読み書きロックで保護
}

// コンストラクタ
func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
	return &SafeMap[K, V]{data: make(map[K]V)}
}

// Set: 書き込み操作 (Lock/Unlock)
func (m *SafeMap[K, V]) Set(key K, value V) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.data[key] = value
}

// Get: 読み取り操作 (RLock/RUnlock)
func (m *SafeMap[K, V]) Get(key K) (V, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	val, ok := m.data[key]
	return val, ok
}

// (Delete, Len などのメソッドも同様に実装可能)

func main() {
	// string -> int のマップを作成
	safeMap := NewSafeMap[string, int]()

	// 複数の Goroutine から安全にアクセスできる
	// (ここでは main Goroutine からのみアクセス)
	safeMap.Set("apple", 100)
	safeMap.Set("banana", 200)

	val, ok := safeMap.Get("apple")
	if ok { fmt.Println("apple:", val) } // apple: 100

	val, ok = safeMap.Get("grape")
	if !ok { fmt.Println("grape: not found") } // grape: not found
}

```

## 解説
```text
Goの組み込みマップ (`map[K]V`) は**スレッドセーフではありません**。
複数の Goroutine から同時に読み書きすると競合が発生します。

複数の Goroutine から安全にアクセスできるマップが必要な場合、
`sync.RWMutex` 等で保護する必要があります。
ジェネリクスを使うと、任意のキー・値の型に対して
**型安全かつスレッドセーフなマップ**を汎用的に実装できます。

**実装方法:**
1. **構造体定義:**
   `type SafeMap[K comparable, V any] struct { ... }`
   *   キー `K` には `comparable` 制約が必要。
   *   値 `V` は `any`。
   *   内部に通常のマップ `map[K]V` と `sync.RWMutex` を持つ。
2. **コンストラクタ:** マップを初期化してポインタを返す。
   `func NewSafeMap[K comparable, V any]() *SafeMap[K,V] { ... }`
3. **メソッド実装:** `Set`, `Get`, `Delete` 等を実装。
   *   内部マップアクセス前に適切なロックを獲得 (`Lock`/`RLock`)。
   *   **`defer` でアンロック** (`Unlock`/`RUnlock`) を保証する。

コード例では `SafeMap` を定義し、`Set` では書き込みロック (`Lock`)、
`Get` では読み取りロック (`RLock`) を使って内部マップへのアクセスを
保護しています。これにより、複数の Goroutine から `Set` や `Get` を
同時に呼び出しても安全です。

**(sync.Map との比較)**
標準ライブラリの `sync.Map` もスレッドセーフなマップですが、
ジェネリクス導入前の設計のため型安全性が低く (値は `any` で扱う)、
特定のユースケース向けです。多くの場合、この例のような
ジェネリックな実装の方が型安全で使いやすいでしょう。