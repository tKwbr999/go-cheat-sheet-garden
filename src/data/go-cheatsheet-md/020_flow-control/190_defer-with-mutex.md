## タイトル
title: 制御構文: `defer` とミューテックス (`sync.Mutex`)

## タグ
tags: ["flow-control", "defer", "mutex", "sync", "並行処理", "ロック", "アンロック", "リソース解放"]

## コード
```go
package main

import (
	"fmt"
	"sync"
)

// 共有データとMutexを持つ構造体
type SafeCounter struct {
	mu    sync.Mutex
	value int
}

// 値を安全にインクリメントするメソッド
func (c *SafeCounter) Increment() {
	c.mu.Lock() // ロック取得
	// ★ Lock() の直後に Unlock() を defer で予約
	defer c.mu.Unlock()

	// --- クリティカルセクション ---
	c.value++
	fmt.Printf("インクリメント実行中: %d\n", c.value)
	// --- クリティカルセクション終了 ---
	// 関数終了時に defer された Unlock が実行される
}

// main 関数 (呼び出し例) は省略
// func main() {
// 	counter := SafeCounter{}
// 	// 複数の Goroutine から counter.Increment() を呼び出す
// }
```

## 解説
```text
`defer` の重要な用途の一つが、**ミューテックス (`sync.Mutex`)** の
アンロック処理です。ミューテックスは、複数の Goroutine が
共有データに同時にアクセスして競合状態になるのを防ぐ
排他制御の仕組みです。

**`sync.Mutex` と `Lock`/`Unlock`:**
*   `mu.Lock()`: ロックを取得。他の Goroutine がロック中なら待機。
*   `mu.Unlock()`: ロックを解放。

共有データアクセス前には `Lock()`、アクセス後には**必ず `Unlock()`**
が必要です。`Unlock()` を忘れるとデッドロック（停止）します。

**`defer` による確実なアンロック:**
`Lock()` を呼び出した直後に `defer mu.Unlock()` を書くのが
Goの定石です。これにより、関数がどのように終了しても
（正常、エラー、パニック）、**確実に `Unlock()` が
呼び出される**ことが保証されます。

コード例の `Increment` メソッドでは、
`c.mu.Lock()` の直後に `defer c.mu.Unlock()` を記述しています。
これにより、`c.value++` の処理（クリティカルセクション）が
安全に行われ、メソッド終了時に必ずロックが解放されます。

`defer` を使ったアンロックは、Goの並行プログラミングにおける
デッドロックのリスクを大幅に減らすための重要テクニックです。