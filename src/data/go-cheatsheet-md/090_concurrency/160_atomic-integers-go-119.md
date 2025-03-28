---
title: "並行処理: アトミック操作 (`sync/atomic` パッケージ)"
tags: ["concurrency", "goroutine", "sync", "atomic", "アトミック操作", "競合状態", "低レベル同期", "Go1.19"]
---

`sync.Mutex` は共有メモリへのアクセスを保護する汎用的な方法ですが、単純なカウンターのインクリメントやフラグの設定など、特定の操作に対しては、より低レベルで効率的な同期方法として**アトミック操作 (Atomic Operations)** があります。

アトミック操作は、CPUレベルで**不可分 (atomic)** に実行されることが保証されている操作です。つまり、操作の途中で他の Goroutine が割り込むことがありません。これにより、Mutex のようなロック機構を使わずに、特定の型の変数に対する単純な操作を競合状態なく安全に行うことができます。

## `sync/atomic` パッケージ

Goの標準ライブラリ **`sync/atomic`** パッケージは、アトミック操作のための関数を提供します。

*   **Go 1.18 以前:** 主に `int32`, `int64`, `uint32`, `uint64`, `uintptr`, `unsafe.Pointer` 型に対する低レベルな関数（例: `atomic.AddInt64`, `atomic.LoadUint32`, `atomic.CompareAndSwapPointer`）を提供していました。これらは少し使い方が煩雑でした。
*   **Go 1.19 以降:** より使いやすい**アトミック型** (`atomic.Int32`, `atomic.Int64`, `atomic.Uint32`, `atomic.Uint64`, `atomic.Bool`, `atomic.Pointer[T]`) が導入されました。これらの型はメソッドとしてアトミック操作を提供し、型安全性が向上しています。**通常はこちらを使うことが推奨されます。**

## `atomic` 型 (Go 1.19+) の使い方

ここでは Go 1.19 で導入されたアトミック型を中心に説明します。`import "sync/atomic"` として利用します。

1.  アトミックに操作したい型の変数（例: `int64` のカウンター）を、対応する `atomic` 型（例: `atomic.Int64`）で宣言します。
    ```go
    var counter atomic.Int64 // ゼロ値は 0
    ```
2.  その型のメソッドを使ってアトミック操作を行います。

**主なメソッド:**

*   **`Load() T`**: 現在の値をアトミックに読み取ります。
*   **`Store(val T)`**: 新しい値 `val` をアトミックに書き込みます。
*   **`Add(delta T) T`**: 値に `delta` をアトミックに加算し、**加算後の新しい値**を返します。
*   **`Swap(new T) T`**: 新しい値 `new` をアトミックに書き込み、**書き込む前の古い値**を返します。
*   **`CompareAndSwap(old, new T) bool`**: 現在の値が `old` と等しければ、値を `new` にアトミックに更新し `true` を返します。等しくなければ何もせず `false` を返します (CAS操作)。

## コード例: アトミックカウンター

複数の Goroutine がカウンターをインクリメントする例を、`atomic.Int64` を使って実装します。

```go title="atomic.Int64 を使ったカウンター"
package main

import (
	"fmt"
	"sync"
	"sync/atomic" // atomic パッケージをインポート
)

func main() {
	var wg sync.WaitGroup
	var counter atomic.Int64 // ★ atomic.Int64 型でカウンターを宣言
	iterations := 1000

	fmt.Printf("%d 回インクリメントします...\n", iterations)

	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go func() {
			defer wg.Done()
			// ★ counter.Add(1) でアトミックにインクリメント ★
			// Mutex によるロック/アンロックは不要
			counter.Add(1)
		}()
	}

	wg.Wait() // すべての Goroutine が完了するのを待つ

	// ★ counter.Load() でアトミックに値を読み取る ★
	finalCount := counter.Load()
	fmt.Printf("最終カウンター: %d (期待値: %d)\n", finalCount, iterations)

	// --- その他の操作例 ---
	fmt.Println("\n--- その他の操作 ---")

	// CompareAndSwap: 現在値が 1000 なら 0 にする
	swapped := counter.CompareAndSwap(1000, 0)
	fmt.Printf("CompareAndSwap(1000, 0): %t, 現在値: %d\n", swapped, counter.Load())

	// Swap: 現在値を 500 に設定し、古い値を取得
	oldValue := counter.Swap(500)
	fmt.Printf("Swap(500): 古い値=%d, 現在値: %d\n", oldValue, counter.Load())

	// Store: 現在値を -100 に設定
	counter.Store(-100)
	fmt.Printf("Store(-100): 現在値: %d\n", counter.Load())
}

/* 実行結果:
1000 回インクリメントします...
最終カウンター: 1000 (期待値: 1000)

--- その他の操作 ---
CompareAndSwap(1000, 0): true, 現在値: 0
Swap(500): 古い値=0, 現在値: 500
Store(-100): 現在値: -100
*/
```

**コード解説:**

*   `var counter atomic.Int64`: 64ビット整数をアトミックに操作するための `atomic.Int64` 型の変数を宣言します。
*   `counter.Add(1)`: Mutex を使わずに、カウンターの値をアトミックに（競合なく）インクリメントします。
*   `counter.Load()`: カウンターの現在の値をアトミックに読み取ります。
*   `counter.CompareAndSwap(1000, 0)`: `counter` の現在の値が 1000 であれば、アトミックに 0 に更新し `true` を返します。
*   `counter.Swap(500)`: `counter` の値をアトミックに 500 に更新し、更新前の値 (この場合は 0) を返します。
*   `counter.Store(-100)`: `counter` の値をアトミックに -100 に設定します。

**Mutex との比較:**

*   **パフォーマンス:** 単純な数値のインクリメントや読み書きのような操作では、アトミック操作は Mutex よりもCPUレベルで効率的に実行されるため、一般的にオーバーヘッドが小さくなります。
*   **複雑さ:** Mutex は `Lock`/`Unlock` でコードブロック全体を保護するのに対し、アトミック操作は個々の操作（加算、読み取り、書き込みなど）の原子性を保証します。複数のアトミック操作を組み合わせて複雑な処理を行う場合、その全体の原子性を保証するのは難しくなることがあります。
*   **適用範囲:** Mutex は任意のコード領域を保護できますが、アトミック操作は特定のプリミティブ型（整数、ポインタなど）に対する特定の操作に限定されます。

**使い分け:**

*   単純なカウンター、フラグ、統計情報の更新など、アトミック操作が提供する機能で十分な場合は、パフォーマンス上の利点からアトミック操作の利用を検討します。
*   複数の変数をまとめて更新する必要がある場合や、より複雑なデータ構造を保護する必要がある場合は、Mutex を使うのが適切です。

アトミック操作は低レベルな同期メカニズムであり、Mutex よりも注意深く使う必要がありますが、特定の状況下では有効な選択肢となります。