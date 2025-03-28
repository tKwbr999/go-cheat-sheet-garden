---
title: "並行処理: Goroutine の終了を待つ (`sync.WaitGroup`)"
tags: ["concurrency", "goroutine", "sync", "WaitGroup", "同期", "Add", "Done", "Wait"]
---

前のセクションで見たように、`go` キーワードで Goroutine を起動しても、呼び出し元の Goroutine はその終了を待ちません。`main` 関数が終了すると、他の Goroutine が処理途中であってもプログラム全体が終了してしまいます。

起動した Goroutine の処理が完了するのを**確実に待つ**ためには、**同期 (Synchronization)** のための仕組みが必要です。そのための最も基本的なツールの一つが、標準ライブラリの **`sync`** パッケージにある **`WaitGroup`** です。

## `sync.WaitGroup` とは？

`WaitGroup` は、複数の Goroutine の完了を待つためのカウンターを提供します。主なメソッドは以下の3つです。

*   **`Add(delta int)`**: `WaitGroup` の内部カウンターに `delta` を加算します。通常、起動する Goroutine の**数**を最初に `Add` で設定します。
*   **`Done()`**: `WaitGroup` の内部カウンターを 1 減らします。各 Goroutine は、その処理が**完了した**ことを通知するために、**`defer wg.Done()`** の形でこのメソッドを呼び出すのが一般的です。
*   **`Wait()`**: `WaitGroup` の内部カウンターが **0 になるまで**、`Wait()` を呼び出した Goroutine の実行を**ブロック**（待機）します。

## `WaitGroup` の基本的な使い方

1.  `sync.WaitGroup` 型の変数を宣言します (`var wg sync.WaitGroup`)。
2.  起動する Goroutine の数を `wg.Add(数)` でカウンターに設定します。
3.  各 Goroutine を `go` キーワードで起動します。
4.  起動される Goroutine の関数内で、**最初に `defer wg.Done()`** を記述します。これにより、Goroutine が（`return` や `panic` などで）終了する際に必ずカウンターが減算されます。
5.  すべての Goroutine を起動した後、`wg.Wait()` を呼び出します。これにより、`Add` で設定した数の `Done` が呼び出され、カウンターが 0 になるまで `main` Goroutine (または `Wait` を呼び出した Goroutine) は待機します。

```go title="WaitGroup を使って Goroutine の終了を待つ"
package main

import (
	"fmt"
	"sync" // sync パッケージをインポート
	"time"
)

// Goroutine で実行するワーカー関数
func worker(id int, wg *sync.WaitGroup) {
	// ★★★ 4. Goroutine 終了時に Done() を呼ぶように defer で登録 ★★★
	defer wg.Done() // これでカウンターが減る

	fmt.Printf("ワーカー %d: 開始\n", id)
	// 何らかの処理をシミュレート
	time.Sleep(time.Duration(id+1) * 100 * time.Millisecond)
	fmt.Printf("ワーカー %d: 終了\n", id)
}

func main() {
	// 1. WaitGroup を宣言
	var wg sync.WaitGroup

	numWorkers := 3
	fmt.Printf("%d 個のワーカー Goroutine を起動します...\n", numWorkers)

	// 2. 起動する Goroutine の数を Add で設定
	wg.Add(numWorkers)

	// 3. Goroutine を起動
	for i := 1; i <= numWorkers; i++ {
		// worker 関数に WaitGroup のポインタを渡す
		go worker(i, &wg)
	}

	fmt.Println("すべてのワーカーの終了を待機します...")
	// 5. Wait() でカウンターが 0 になるのを待つ
	wg.Wait() // すべての worker が Done() を呼び出すまでここでブロックされる

	fmt.Println("すべてのワーカーが終了しました。")
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
3 個のワーカー Goroutine を起動します...
すべてのワーカーの終了を待機します...
ワーカー 1: 開始
ワーカー 2: 開始
ワーカー 3: 開始
ワーカー 1: 終了
ワーカー 2: 終了
ワーカー 3: 終了
すべてのワーカーが終了しました。
*/
```

**コード解説:**

*   `var wg sync.WaitGroup`: `WaitGroup` 型の変数 `wg` を宣言します。
*   `wg.Add(numWorkers)`: 起動する Goroutine の数 (3) をカウンターに設定します。
*   `go worker(i, &wg)`: `worker` 関数を Goroutine として起動します。`wg` の**ポインタ** (`&wg`) を渡していることに注意してください。`Done()` メソッドは `WaitGroup` の内部状態を変更するため、ポインタを渡す必要があります。
*   `defer wg.Done()`: `worker` 関数の**最初**で `wg.Done()` を `defer` で登録します。これにより、`worker` 関数がどのように終了しても、最後に必ずカウンターが 1 減らされます。
*   `wg.Wait()`: `main` Goroutine はここで待機します。3つの `worker` Goroutine がすべて `wg.Done()` を呼び出し、カウンターが 0 になると、`Wait()` のブロックが解除され、`main` Goroutine は次の処理に進みます。

`sync.WaitGroup` は、複数の Goroutine を起動し、それら**すべて**の完了を待ち合わせるための、シンプルで効果的な方法です。`time.Sleep` のような不確実な方法ではなく、このような同期プリミティブを使うことが重要です。