---
title: "ジェネリクス: スレッドセーフなジェネリックマップ"
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "マップ", "map", "sync", "RWMutex", "スレッドセーフ", "comparable"]
---

Goの組み込みのマップ (`map[K]V`) は非常に便利ですが、**スレッドセーフではありません**。つまり、複数の Goroutine から同時にマップの読み書きを行うと、競合状態が発生し、プログラムがクラッシュする可能性があります。

複数の Goroutine から安全にアクセスできるマップが必要な場合、`sync.RWMutex` などを使ってアクセスを保護する必要があります。ジェネリクスを使うと、任意のキー型 `K` と値型 `V` に対して、このような**型安全かつスレッドセーフなマップ**を汎用的に実装できます。

## スレッドセーフなジェネリックマップの実装

1.  **構造体の定義:**
    *   キーの型 `K` と値の型 `V` を型パラメータとして持つ構造体を定義します。
    *   キー `K` には、マップのキーとして使えるように **`comparable`** 制約が必要です。
    *   値 `V` は任意の型で良いので `any` 制約を使います。
    *   構造体のフィールドとして、内部的にデータを保持するための通常のマップ (`map[K]V`) と、アクセスを保護するための `sync.RWMutex` を持ちます。
2.  **コンストラクタ:** マップを初期化して構造体のポインタを返すコンストラクタ関数を用意します。
3.  **メソッドの実装:** `Set`, `Get`, `Delete` などのマップ操作を行うメソッドを実装します。
    *   各メソッド内で、内部マップにアクセスする**前**に適切なロック（書き込みなら `Lock()`, 読み取りなら `RLock()`）を獲得し、**`defer` でアンロック**します。

## コード例: `SafeMap[K, V]`

```go title="スレッドセーフなジェネリックマップ SafeMap"
package main

import (
	"fmt"
	"sync" // RWMutex を使うため
)

// --- スレッドセーフなジェネリックマップ SafeMap の定義 ---
// K: キーの型 (比較可能である必要がある)
// V: 値の型 (任意の型)
type SafeMap[K comparable, V any] struct {
	data map[K]V      // 実際のデータを保持するマップ
	mu   sync.RWMutex // マップへのアクセスを保護する RWMutex
}

// --- コンストラクタ ---
// 新しい SafeMap を作成してポインタを返す
func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
	return &SafeMap[K, V]{
		data: make(map[K]V), // 内部マップを初期化
		// mu はゼロ値 (アンロック状態) で初期化される
	}
}

// --- メソッド ---

// Set: キーと値をマップに設定する (書き込み操作)
func (m *SafeMap[K, V]) Set(key K, value V) {
	// 書き込みロックを獲得
	m.mu.Lock()
	// defer でアンロック
	defer m.mu.Unlock()
	// 内部マップに値を設定
	m.data[key] = value
}

// Get: キーに対応する値を取得する (読み取り操作)
func (m *SafeMap[K, V]) Get(key K) (V, bool) {
	// 読み取りロックを獲得 (他のリーダーはブロックされない)
	m.mu.RLock()
	// defer でアンロック
	defer m.mu.RUnlock()
	// 内部マップから値を取得
	val, ok := m.data[key]
	return val, ok
}

// Delete: キーに対応する要素を削除する (書き込み操作)
func (m *SafeMap[K, V]) Delete(key K) {
	// 書き込みロックを獲得
	m.mu.Lock()
	defer m.mu.Unlock()
	// 内部マップから要素を削除
	delete(m.data, key)
}

// Len: マップの要素数を返す (読み取り操作)
func (m *SafeMap[K, V]) Len() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.data)
}

func main() {
	// --- SafeMap の使用例 ---

	// string をキー、int を値とする SafeMap を作成
	// K=string (comparable), V=int (any)
	safeMap := NewSafeMap[string, int]()

	var wg sync.WaitGroup
	numWrites := 5
	numReads := 10

	// --- 複数の Goroutine から同時に書き込み ---
	wg.Add(numWrites)
	for i := 0; i < numWrites; i++ {
		go func(k string, v int) {
			defer wg.Done()
			safeMap.Set(k, v) // Set メソッドで安全に書き込み
			fmt.Printf("Set: %s = %d\n", k, v)
		}(fmt.Sprintf("key%d", i), i*10)
	}

	// --- 複数の Goroutine から同時に読み込み ---
	wg.Add(numReads)
	for i := 0; i < numReads; i++ {
		go func(k string) {
			defer wg.Done()
			// Get メソッドで安全に読み込み
			val, ok := safeMap.Get(k)
			if ok {
				fmt.Printf("Get: %s -> %d\n", k, val)
			} else {
				fmt.Printf("Get: %s -> Not Found\n", k)
			}
			time.Sleep(10 * time.Millisecond) // 他の Goroutine が動く時間を与える
		}(fmt.Sprintf("key%d", i%numWrites)) // 存在するキーと存在しないキーを混ぜる
	}

	wg.Wait() // すべての Goroutine の完了を待つ

	fmt.Printf("\n最終的なマップの要素数: %d\n", safeMap.Len())

	// --- 要素の削除 ---
	safeMap.Delete("key1")
	fmt.Println("key1 を削除しました。")
	val, ok := safeMap.Get("key1")
	fmt.Printf("Get(key1) -> %v, %t\n", val, ok) // 0, false
	fmt.Printf("削除後のマップの要素数: %d\n", safeMap.Len())
}

/* 実行結果の例 (Goroutine の実行順序により出力順は不定):
Set: key0 = 0
Set: key1 = 10
Set: key2 = 20
Set: key3 = 30
Set: key4 = 40
Get: key0 -> 0
Get: key1 -> 10
Get: key2 -> 20
Get: key3 -> 30
Get: key4 -> 40
Get: key0 -> 0
Get: key1 -> 10
Get: key2 -> 20
Get: key3 -> 30
Get: key4 -> 40

最終的なマップの要素数: 5
key1 を削除しました。
Get(key1) -> 0, false
削除後のマップの要素数: 4
*/
```

**コード解説:**

*   `SafeMap[K comparable, V any]` 構造体は、キー `K` と値 `V` の型パラメータを持ちます。`K` には `comparable` 制約が必要です。内部に `map[K]V` と `sync.RWMutex` を持ちます。
*   `NewSafeMap` はジェネリックなコンストラクタ関数です。
*   `Set` と `Delete` メソッドはマップを変更するため、`m.mu.Lock()` と `defer m.mu.Unlock()` で書き込みロックを使います。
*   `Get` と `Len` メソッドはマップを変更しないため、`m.mu.RLock()` と `defer m.mu.RUnlock()` で読み取りロックを使います。これにより、複数の `Get` や `Len` の呼び出しは同時に実行できます。
*   `main` 関数では、複数の Goroutine から `Set` や `Get` を同時に呼び出していますが、`RWMutex` によって内部の `map` へのアクセスが保護されているため、競合状態は発生しません。

このようにジェネリクスと `sync.RWMutex` を組み合わせることで、様々な型のキーと値に対応できる、再利用可能でスレッドセーフなマップを簡単に実装できます。標準ライブラリの `sync.Map` もスレッドセーフなマップを提供しますが、ジェネリクス導入以前に設計されたため型安全性が低く、特定のユースケース向けです。多くの場合、この例のようなジェネリックな `SafeMap` の方が型安全で使いやすいでしょう。