## タイトル
title: 並行処理: アトミック操作 (`sync/atomic` パッケージ)

## タグ
tags: ["concurrency", "goroutine", "sync", "atomic", "アトミック操作", "競合状態", "低レベル同期", "Go1.19"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic" // atomic パッケージ
)

func main() {
	var wg sync.WaitGroup
	var counter atomic.Int64 // ★ atomic.Int64 で宣言
	iterations := 1000

	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go func() {
			defer wg.Done()
			// ★ Add メソッドでアトミックにインクリメント
			counter.Add(1)
		}()
	}
	wg.Wait()

	// ★ Load メソッドでアトミックに読み取り
	finalCount := counter.Load()
	fmt.Printf("最終カウンター: %d\n", finalCount) // 常に 1000
}

```

## 解説
```text
単純なカウンター増減など特定の操作では、`sync.Mutex` より
低レベルで効率的な**アトミック操作 (Atomic Operations)** が使えます。

アトミック操作はCPUレベルで**不可分 (atomic)** に実行され、
操作途中で他の Goroutine が割り込むことがありません。
これにより Mutex なしで競合なく安全に操作できます。

**`sync/atomic` パッケージ:**
アトミック操作関数を提供。`import "sync/atomic"` で利用。
*   **Go 1.19 以降:** 使いやすい**アトミック型**が導入されました。
    `atomic.Int64`, `atomic.Uint64`, `atomic.Bool`,
    `atomic.Pointer[T]` など。メソッドで操作します。
    **こちらを使うのが推奨**です。
*   (Go 1.18 以前: 低レベル関数 `atomic.AddInt64` 等が中心でした)

**アトミック型 (Go 1.19+) の使い方:**
1. `var counter atomic.Int64` のようにアトミック型で変数を宣言。
2. メソッドで操作。

**主なメソッド:**
*   `Load() T`: 現在値をアトミックに読み取り。
*   `Store(val T)`: 値 `val` をアトミックに書き込み。
*   `Add(delta T) T`: `delta` をアトミックに加算し、**加算後の値**を返す。
*   `Swap(new T) T`: `new` をアトミックに書き込み、**古い値**を返す。
*   `CompareAndSwap(old, new T) bool`: 現在値が `old` なら `new` に
    アトミックに更新し `true` を返す (CAS操作)。

コード例では `atomic.Int64` を使い、複数の Goroutine が
`counter.Add(1)` で安全にインクリメントしています。
最後に `counter.Load()` で結果を取得します。Mutex は不要です。

**Mutex との比較・使い分け:**
*   **パフォーマンス:** 単純な数値操作等ではアトミック操作の方が
    オーバーヘッドが小さい傾向。
*   **複雑さ:** Mutex はコードブロック全体を保護。アトミック操作は
    個々の操作の原子性を保証。複雑な処理の組み合わせには Mutex が適す。
*   **適用範囲:** Mutex は任意コード、アトミック操作は特定型・操作限定。

単純なカウンターやフラグ更新にはアトミック操作、
複雑なデータ構造や複数変数の保護には Mutex を検討します。