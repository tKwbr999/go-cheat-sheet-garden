---
title: "制御構文: `defer` とミューテックス (`sync.Mutex`)"
tags: ["flow-control", "defer", "mutex", "sync", "並行処理", "ロック", "アンロック", "リソース解放"]
---

`defer` 文の非常に一般的で重要な使い方のひとつが、**ミューテックス (Mutex)** のアンロック処理です。ミューテックスは、Goの並行処理において、複数の Goroutine が同時に共有データにアクセスして競合状態（予期しない結果を引き起こす状態）になるのを防ぐための仕組み（排他制御）です。

## ミューテックス (`sync.Mutex`) と `Lock`/`Unlock`

標準ライブラリの `sync` パッケージには `Mutex` 型が用意されています。

*   `mu.Lock()`: ミューテックス `mu` をロックします。他の Goroutine が既にロックを取得している場合、`Lock()` を呼び出した Goroutine はロックが解放されるまで待機します。ロックを取得できたら処理を続行します。
*   `mu.Unlock()`: 取得していたロックを解放します。これにより、待機していた他の Goroutine がロックを取得できるようになります。

共有データにアクセスする前には必ず `Lock()` を呼び出し、アクセスが終わったら**必ず `Unlock()` を呼び出してロックを解放する**必要があります。`Unlock()` を忘れると、他の Goroutine が永遠にロックを取得できなくなり、プログラムがデッドロック（停止）してしまいます。

## `defer` による確実なアンロック

`Lock()` を呼び出した直後に `defer mu.Unlock()` を記述するのが、Goにおける定石です。これにより、関数がどのように終了しても（正常終了、エラーによる早期リターン、あるいはパニックによる異常終了）、**確実に `Unlock()` が呼び出される**ことが保証されます。

```go title="defer を使った Mutex のアンロック"
package main

import (
	"fmt"
	"sync" // Mutex を使うためにインポート
	"time"
)

// 複数の Goroutine からアクセスされる可能性のあるカウンター
type SafeCounter struct {
	mu    sync.Mutex // Mutex (埋め込みフィールドではない)
	value int
}

// カウンターを安全にインクリメントするメソッド
func (c *SafeCounter) Increment() {
	// ★ ロックを取得
	c.mu.Lock()
	// ★★★ Lock() の直後に Unlock() を defer で予約 ★★★
	// これにより、このメソッドが終了する際に必ずアンロックされる
	defer c.mu.Unlock()

	// --- クリティカルセクション ---
	// (ロックによって保護された区間)
	c.value++
	fmt.Printf("インクリメント: 現在値 = %d\n", c.value)
	// --- クリティカルセクション終了 ---

	// もしここでエラーが発生して return したとしても、defer された Unlock は実行される
	// if someError { return }
}

// カウンターの現在の値を安全に取得するメソッド
func (c *SafeCounter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

func main() {
	counter := SafeCounter{} // ゼロ値で初期化 (value=0)

	// 複数の Goroutine を起動してカウンターをインクリメントする
	var wg sync.WaitGroup // Goroutine の終了を待つための WaitGroup
	numGoroutines := 5

	wg.Add(numGoroutines) // 待機する Goroutine の数を設定

	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			defer wg.Done() // Goroutine 終了時に WaitGroup に通知
			fmt.Printf("Goroutine %d: 開始\n", id)
			for j := 0; j < 3; j++ {
				counter.Increment() // 安全にインクリメント
				time.Sleep(10 * time.Millisecond)
			}
			fmt.Printf("Goroutine %d: 終了\n", id)
		}(i)
	}

	// すべての Goroutine が終了するのを待つ
	wg.Wait()

	// 最終的なカウンターの値を取得して表示
	finalValue := counter.Value()
	fmt.Printf("\n最終的なカウンターの値: %d\n", finalValue) // 期待値: 5 * 3 = 15
}

/* 実行結果 (Goroutine の実行順序により出力順は変わるが、最終値は15になるはず):
Goroutine 0: 開始
インクリメント: 現在値 = 1
Goroutine 4: 開始
インクリメント: 現在値 = 2
Goroutine 1: 開始
インクリメント: 現在値 = 3
Goroutine 2: 開始
インクリメント: 現在値 = 4
Goroutine 3: 開始
インクリメント: 現在値 = 5
インクリメント: 現在値 = 6
インクリメント: 現在値 = 7
... (途中省略) ...
インクリメント: 現在値 = 14
Goroutine 1: 終了
インクリメント: 現在値 = 15
Goroutine 0: 終了

最終的なカウンターの値: 15
*/
```

**コード解説:**

*   `SafeCounter` 構造体は、カウンターの値 `value` と、それを保護するための `sync.Mutex` 型のフィールド `mu` を持ちます。
*   `Increment` メソッドでは、まず `c.mu.Lock()` でロックを取得します。
*   **`defer c.mu.Unlock()`**: ロック取得直後にアンロック処理を `defer` で予約します。これにより、`Increment` メソッド内のどこで処理が終わっても（例えば将来的にエラーチェックで `return` する場合でも）、必ず最後に `Unlock()` が呼ばれます。
*   `c.value++` の部分は**クリティカルセクション**と呼ばれ、一度に一つの Goroutine しか実行できないように `Lock()` と `Unlock()` で保護されています。
*   `Value` メソッドも同様に、値の読み取り時にもロックを取得し、`defer` でアンロックしています（複数の Goroutine が同時に読み書きする場合、読み取り時もロックが必要な場合があります）。
*   `main` 関数では、複数の Goroutine (`go func(...)`) が並行して `counter.Increment()` を呼び出しますが、ミューテックスと `defer` によって `c.value` が安全に更新され、最終的に期待通りの値 (15) になります。

`defer` を使ったアンロックは、Goの並行プログラミングにおける非常に重要で基本的なテクニックです。これにより、ロックの解放忘れによるデッドロックのリスクを大幅に減らすことができます。