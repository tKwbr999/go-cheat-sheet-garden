## タイトル
title: 複数の Goroutine と WaitGroup

## タグ
tags: ["concurrency", "goroutine", "sync", "WaitGroup", "同期", "ループ", "クロージャ"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup
	numWorkers := 5

	fmt.Printf("%d 個のワーカー起動...\n", numWorkers)

	// ループで複数の Goroutine を起動
	for i := 1; i <= numWorkers; i++ {
		wg.Add(1) // Goroutine 起動前にカウンターを増やす
		// ループ変数 i を Goroutine に引数として渡す
		go func(workerID int) {
			defer wg.Done() // Goroutine 完了時にカウンターを減らす

			fmt.Printf("Worker %d: Start\n", workerID)
			time.Sleep(time.Duration(workerID) * 50 * time.Millisecond)
			fmt.Printf("Worker %d: End\n", workerID)
		}(i) // ★ 現在の i の値を引数として渡す
	}

	fmt.Println("全ワーカーの終了待機...")
	wg.Wait() // カウンターが 0 になるまで待つ

	fmt.Println("全ワーカー終了")
}

```

## 解説
```text
`sync.WaitGroup` は**複数**の Goroutine の完了待ちに使われます。
`for` ループで複数の Goroutine を起動し、待つのが一般的です。

**ループでの使い方:**
1. `var wg sync.WaitGroup` で宣言。
2. ループ**前**に `wg.Add(総数)` で設定、
   またはループ**内**で Goroutine 起動**前**に `wg.Add(1)`。
3. ループ内で `go` で Goroutine を起動。
4. Goroutine 関数内で**最初に `defer wg.Done()`**。
5. ループ終了後、`wg.Wait()` で待機。

**ループ変数とクロージャの注意点:**
`for` ループ内で Goroutine を起動し、ループ変数 (例: `i`) を
Goroutine 内の無名関数 (クロージャ) で使う場合、注意が必要です。
クロージャはループ変数自体への参照をキャプチャするため、
Goroutine 実行時にはループ変数の値が変わっている可能性があります。

**対策:**
*   **引数で渡す (コード例の方法):**
    `go func(id int){ ... }(i)` のように、Goroutine に
    ループ変数の**現在の値**を引数として渡します。
    Goroutine 内ではその引数を使います。
*   **変数をコピー (Go 1.22 より前のイディオム):**
    ループ内で `i := i` のように新しい変数を作成し、
    現在の値をコピーします。クロージャはその内側の変数を
    キャプチャします。

コード例では、ループ内で `wg.Add(1)` し、無名関数 Goroutine に
ループ変数 `i` の値を引数 `workerID` として渡しています。
これにより、各 Goroutine は正しい ID で動作します。
最後に `wg.Wait()` で全 Goroutine の完了を待ちます。

`WaitGroup` は複数の並行タスク完了待ちに非常に役立ちます。
ループ変数には注意しましょう。