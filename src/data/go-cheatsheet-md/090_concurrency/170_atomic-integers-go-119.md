---
title: "並行処理: アトミック操作 (Go 1.19 未満の古い方法)"
tags: ["concurrency", "goroutine", "sync", "atomic", "アトミック操作", "競合状態", "低レベル同期"]
---

**注意:** このセクションで説明する方法は、Go 1.19 より前のバージョンで使われていた `sync/atomic` パッケージの関数群です。**Go 1.19 以降**では、前のセクション (`160_atomic-integers-go-119.md`) で説明した**アトミック型 (`atomic.Int64` など) を使うことが推奨されます**。アトミック型の方が型安全で使いやすいためです。

ここでは、古いコードやライブラリで使われている可能性のある、Go 1.19 未満の関数ベースのアトミック操作について参考として示します。

## `sync/atomic` の関数 (Go 1.19 未満)

Go 1.19 より前では、`sync/atomic` パッケージは主に以下のような関数を提供していました。これらの関数は、操作対象の変数の**ポインタ**を第一引数に取ります。

*   `atomic.AddInt64(addr *int64, delta int64) (new int64)`: `*addr` の値に `delta` をアトミックに加算し、加算後の値を返します。(`Uint32`, `Uint64`, `Int32` 版もあります)
*   `atomic.LoadInt64(addr *int64) (val int64)`: `*addr` の値をアトミックに読み取ります。(`Uint32`, `Uint64`, `Int32`, `Pointer` 版などもあります)
*   `atomic.StoreInt64(addr *int64, val int64)`: `*addr` に `val` をアトミックに書き込みます。(`Uint32`, `Uint64`, `Int32`, `Pointer` 版などもあります)
*   `atomic.SwapInt64(addr *int64, new int64) (old int64)`: `*addr` に `new` をアトミックに書き込み、書き込む前の古い値を返します。(`Uint32`, `Uint64`, `Int32`, `Pointer` 版などもあります)
*   `atomic.CompareAndSwapInt64(addr *int64, old, new int64) (swapped bool)`: `*addr` の現在の値が `old` と等しければ、値を `new` にアトミックに更新し `true` を返します。等しくなければ何もせず `false` を返します。(`Uint32`, `Uint64`, `Int32`, `Pointer` 版などもあります)

## コード例 (Go 1.19 未満のスタイル)

```go title="関数ベースのアトミック操作 (Go < 1.19)"
package main

import (
	"fmt"
	"sync"
	"sync/atomic" // atomic パッケージをインポート
)

func main() {
	var wg sync.WaitGroup
	var counter int64 // ★ 通常の int64 型で宣言
	iterations := 1000

	fmt.Printf("%d 回インクリメントします...\n", iterations)

	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go func() {
			defer wg.Done()
			// ★ atomic.AddInt64 でアトミックにインクリメント ★
			// 第一引数にはカウンター変数のポインタ (&counter) を渡す
			atomic.AddInt64(&counter, 1)
		}()
	}

	wg.Wait() // すべての Goroutine が完了するのを待つ

	// ★ atomic.LoadInt64 でアトミックに値を読み取る ★
	// 第一引数にはカウンター変数のポインタ (&counter) を渡す
	finalCount := atomic.LoadInt64(&counter)
	fmt.Printf("最終カウンター: %d (期待値: %d)\n", finalCount, iterations)

	// --- その他の操作例 ---
	fmt.Println("\n--- その他の操作 ---")

	// CompareAndSwap: 現在値が 1000 なら 0 にする
	swapped := atomic.CompareAndSwapInt64(&counter, 1000, 0)
	fmt.Printf("CompareAndSwapInt64(1000, 0): %t, 現在値: %d\n", swapped, atomic.LoadInt64(&counter))

	// Swap: 現在値を 500 に設定し、古い値を取得
	oldValue := atomic.SwapInt64(&counter, 500)
	fmt.Printf("SwapInt64(500): 古い値=%d, 現在値: %d\n", oldValue, atomic.LoadInt64(&counter))

	// Store: 現在値を -100 に設定
	atomic.StoreInt64(&counter, -100)
	fmt.Printf("StoreInt64(-100): 現在値: %d\n", atomic.LoadInt64(&counter))
}

/* 実行結果:
1000 回インクリメントします...
最終カウンター: 1000 (期待値: 1000)

--- その他の操作 ---
CompareAndSwapInt64(1000, 0): true, 現在値: 0
SwapInt64(500): 古い値=0, 現在値: 500
StoreInt64(-100): 現在値: -100
*/
```

**コード解説:**

*   `var counter int64`: カウンター変数は通常の `int64` 型で宣言します。
*   `atomic.AddInt64(&counter, 1)`: `AddInt64` 関数の第一引数に、カウンター変数 `counter` の**ポインタ** (`&counter`) を渡してインクリメントします。
*   `atomic.LoadInt64(&counter)`: 同様に、読み取り時もポインタを渡します。
*   他の操作 (`CompareAndSwapInt64`, `SwapInt64`, `StoreInt64`) も同様に、第一引数にポインタを取ります。

この関数ベースの方法は Go 1.19 以降でも利用可能ですが、新しいアトミック型 (`atomic.Int64` など) を使う方が、メソッド呼び出しの形式で直感的に記述でき、型安全性も高まるため、**Go 1.19 以降の開発ではアトミック型を使うことが強く推奨されます**。