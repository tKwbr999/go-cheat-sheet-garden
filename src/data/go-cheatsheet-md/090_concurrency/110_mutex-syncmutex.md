---
title: "並行処理: 共有メモリの保護 (`sync.Mutex`)"
tags: ["concurrency", "goroutine", "sync", "Mutex", "相互排他ロック", "競合状態", "Race Condition", "Lock", "Unlock", "defer"]
---

複数の Goroutine が同じ変数（メモリ領域）に**同時に書き込み**を行おうとしたり、一方が書き込んでいる最中に他方が読み取ろうとしたりすると、**競合状態 (Race Condition)** と呼ばれる問題が発生する可能性があります。競合状態が発生すると、プログラムの動作が予測不能になり、データの破損や予期せぬクラッシュを引き起こす可能性があります。

Goでは、このような共有メモリへのアクセスを安全に行うための同期プリミティブが提供されています。その最も基本的なものが **`sync.Mutex` (相互排他ロック)** です。

## `sync.Mutex` とは？

*   `Mutex` は "Mutual Exclusion" (相互排他) の略です。
*   `sync.Mutex` は、一度に**一つの Goroutine だけ**が特定のコード領域（クリティカルセクション）を実行できるようにするためのロック機構を提供します。
*   共有リソース（変数など）にアクセスするコードの前でロック (`Lock()`) を獲得し、アクセスが終わったらロックを解放 (`Unlock()`) します。
*   ある Goroutine がロックを獲得している間、他の Goroutine が同じ Mutex に対して `Lock()` を呼び出すと、ロックが解放されるまで**ブロック**されます。

## `sync.Mutex` の使い方

1.  保護したい共有リソースと一緒に `sync.Mutex` 型の変数を宣言します (`var mu sync.Mutex`)。通常、構造体のフィールドとして Mutex を持つことも多いです。
2.  共有リソースにアクセスするコード（クリティカルセクション）の**直前**で `mu.Lock()` を呼び出してロックを獲得します。
3.  **`defer mu.Unlock()`** を使って、関数がどのように終了しても（正常終了、`return`、`panic` など）、**必ずロックが解放される**ようにします。これは非常に重要です。`Unlock` を忘れると、他の Goroutine が永遠にブロックされ、デッドロックを引き起こす可能性があります。
4.  `Lock()` と `Unlock()` の間で、共有リソースへのアクセス（読み取りや書き込み）を行います。

## コード例: カウンターのインクリメント

複数の Goroutine が共有のカウンター変数をインクリメントする例を見てみましょう。Mutex を使わない場合と使う場合を比較します。

```go title="Mutex による競合状態の防止"
package main

import (
	"fmt"
	"sync"
	"time"
)

// --- Mutex を使わない場合 (競合状態が発生する可能性) ---
func unsafeIncrement(wg *sync.WaitGroup, counter *int) {
	defer wg.Done()
	// 複数の Goroutine が同時に counter を読み書きしようとする
	// 読み取り -> 加算 -> 書き込み の間に他の Goroutine が割り込む可能性がある
	*counter = *counter + 1
}

// --- Mutex を使う場合 (安全) ---
var mu sync.Mutex // 共有カウンターを保護するための Mutex

func safeIncrement(wg *sync.WaitGroup, counter *int) {
	defer wg.Done()

	// クリティカルセクションに入る前にロックを獲得
	mu.Lock()
	// ★ この defer により、関数終了時に必ず Unlock される ★
	defer mu.Unlock()

	// Lock() と Unlock() の間は、一度に一つの Goroutine しか実行できない
	// これにより、カウンターへのアクセスが保護される
	*counter = *counter + 1
}

func main() {
	var wg sync.WaitGroup
	iterations := 1000

	// --- Mutex なし ---
	fmt.Println("--- Mutex なし ---")
	unsafeCounter := 0
	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go unsafeIncrement(&wg, &unsafeCounter)
	}
	wg.Wait()
	// 期待値は 1000 だが、競合状態によりそれより少ない値になる可能性が高い
	fmt.Printf("最終カウンター (Mutex なし): %d (期待値: %d)\n", unsafeCounter, iterations)

	// --- Mutex あり ---
	fmt.Println("\n--- Mutex あり ---")
	safeCounter := 0
	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go safeIncrement(&wg, &safeCounter)
	}
	wg.Wait()
	// Mutex によりアクセスが保護されるため、常に期待値になる
	fmt.Printf("最終カウンター (Mutex あり): %d (期待値: %d)\n", safeCounter, iterations)

	// --- 競合検出器 (Race Detector) ---
	// Go には競合状態を検出するためのツールがあります。
	// go run -race main.go や go build -race main.go で実行すると、
	// unsafeIncrement のようなコードで競合が検出された場合に報告してくれます。
}

/* 実行結果の例 (Mutex なしの結果は実行ごとに変わる可能性あり):
--- Mutex なし ---
最終カウンター (Mutex なし): 945 (期待値: 1000) <- 期待値より少ない！

--- Mutex あり ---
最終カウンター (Mutex あり): 1000 (期待値: 1000) <- 常に期待値になる
*/
```

**コード解説:**

*   **`unsafeIncrement`:** Mutex を使わずに共有変数 `*counter` をインクリメントしています。`*counter = *counter + 1` は、実際には「現在の値を読み取る」「1を加算する」「結果を書き込む」という複数のステップから成り立っており、これらのステップの間に他の Goroutine が割り込むと、加算が失われるなどの競合状態が発生します。そのため、最終的な値が期待値 (1000) より少なくなることがあります。
*   **`safeIncrement`:**
    *   `mu.Lock()`: カウンターへのアクセス前に Mutex をロックします。他の Goroutine が既にロックしていれば、ここでブロックします。
    *   `defer mu.Unlock()`: この関数が終了する際に**必ず** `mu.Unlock()` が呼び出されるようにします。
    *   `*counter = *counter + 1`: ロックされている間は、他の Goroutine はこのコードを実行できないため、カウンターの読み書きは安全に行われます。
*   **結果:** Mutex を使った `safeCounter` は常に期待通りの 1000 になりますが、Mutex を使わない `unsafeCounter` は 1000 より少ない値になる可能性が高いです。

**競合検出器 (`-race`):** Go には競合状態を検出するための `-race` フラグがあります。`go run -race main.go` のようにして実行すると、`unsafeIncrement` のようなコードで競合が発生した場合に警告を出力してくれます。開発中は `-race` フラグを付けてテストを実行することが推奨されます。

`sync.Mutex` は、複数の Goroutine から共有リソースへのアクセスを安全に行うための基本的な方法です。共有メモリを扱う際には、競合状態を防ぐために Mutex や他の同期プリミティブ（チャネルなど）を適切に使用することが不可欠です。