## タイトル
title: 並行処理: Goroutine の終了を待つ (`sync.WaitGroup`)

## タグ
tags: ["concurrency", "goroutine", "sync", "WaitGroup", "同期", "Add", "Done", "Wait"]

## コード
```go
package main

import (
	"fmt"
	"sync" // sync パッケージ
	"time"
)

// Goroutine で実行するワーカー関数
func worker(id int, wg *sync.WaitGroup) {
	// ★ 最初に defer で Done() を登録
	defer wg.Done() // Goroutine 完了時にカウンターを減らす

	fmt.Printf("Worker %d: Start\n", id)
	time.Sleep(time.Duration(id) * 100 * time.Millisecond) // 処理のシミュレート
	fmt.Printf("Worker %d: End\n", id)
}

func main() {
	var wg sync.WaitGroup // WaitGroup を宣言

	numWorkers := 3
	fmt.Printf("Starting %d workers...\n", numWorkers)

	// ★ 起動する Goroutine の数を Add で設定
	wg.Add(numWorkers)

	// Goroutine を起動
	for i := 1; i <= numWorkers; i++ {
		go worker(i, &wg) // wg のポインタを渡す
	}

	fmt.Println("Waiting for workers to finish...")
	// ★ Wait でカウンターが 0 になるのを待つ
	wg.Wait() // 全ての worker が Done() を呼ぶまでブロック

	fmt.Println("All workers finished.")
}

```

## 解説
```text
`go` で起動した Goroutine の終了を待たずに `main` 関数等が
終了すると、起動した Goroutine も途中で終了してしまいます。
完了を確実に待つには**同期**が必要です。
基本的なツールが **`sync.WaitGroup`** です。
`import "sync"` で利用します。

**`sync.WaitGroup` とは？**
複数の Goroutine の完了を待つためのカウンター。
*   **`Add(delta int)`**: カウンターに `delta` を加算。
    通常、起動する Goroutine 数を最初に設定。
*   **`Done()`**: カウンターを 1 減算。
    各 Goroutine は完了時に `defer wg.Done()` で呼ぶのが定石。
*   **`Wait()`**: カウンターが 0 になるまで呼び出し元をブロック。

**基本的な使い方:**
1. `var wg sync.WaitGroup` で宣言。
2. `wg.Add(数)` で起動数を設定。
3. Goroutine を `go` で起動。
4. Goroutine 関数内で**最初に `defer wg.Done()`** を記述。
5. 全 Goroutine 起動後、`wg.Wait()` で待機。

コード例では、3つの `worker` Goroutine を起動し、
各 `worker` は終了時に `defer wg.Done()` を実行します。
`main` 関数は `wg.Wait()` で3つの `Done()` が呼ばれるまで待ちます。

`sync.WaitGroup` は、複数の Goroutine の完了を待ち合わせる
シンプルで効果的な方法です。`time.Sleep` のような不確実な方法ではなく、
このような同期プリミティブを使いましょう。