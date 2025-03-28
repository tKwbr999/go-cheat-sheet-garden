---
title: "並行処理: 複数の Goroutine と WaitGroup"
tags: ["concurrency", "goroutine", "sync", "WaitGroup", "同期", "ループ", "クロージャ"]
---

`sync.WaitGroup` は、**複数**の Goroutine の完了を待ち合わせるために使われます。`for` ループを使って複数の Goroutine を起動し、それらすべての終了を待つのは一般的なパターンです。

## ループでの `WaitGroup` の使い方

1.  `WaitGroup` 変数を宣言します (`var wg sync.WaitGroup`)。
2.  `for` ループの**前**に、起動する Goroutine の総数を `wg.Add(総数)` でカウンターに設定します。
    *   または、ループの**各反復の開始時**に `wg.Add(1)` を呼び出すこともできます（ただし、`go` キーワードで Goroutine を起動する**前**に呼び出す必要があります）。
3.  ループ内で Goroutine を `go` キーワードで起動します。
4.  起動される Goroutine の関数内で、**最初に `defer wg.Done()`** を記述します。
5.  ループが終了した後（すべての Goroutine が起動された後）、`wg.Wait()` を呼び出して、すべての Goroutine が `Done()` を呼び出すのを待ちます。

## ループ変数とクロージャの注意点 (再確認)

`for` ループ内で Goroutine を起動し、その Goroutine がループ変数（例: `for i := ...` の `i`）を利用する場合、注意が必要です。Goroutine 内の関数リテラル（クロージャ）は、ループ変数そのものへの参照をキャプチャするため、Goroutine が実際に実行される時点ではループ変数の値が変わってしまっている可能性があります（通常はループ終了後の最後の値）。

これを避けるためには、**ループの各反復でループ変数の値をコピーした新しい変数を作成**するか、**ループ変数の値を Goroutine に引数として渡す**必要があります。

## コード例

```go title="ループで複数の Goroutine を起動し WaitGroup で待つ"
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	// この Goroutine が終了する際にカウンターを減らす
	defer wg.Done()

	fmt.Printf("ワーカー %d: 開始\n", id)
	// 処理をシミュレート
	time.Sleep(time.Duration(id) * 50 * time.Millisecond)
	fmt.Printf("ワーカー %d: 終了\n", id)
}

func main() {
	var wg sync.WaitGroup
	numWorkers := 5

	fmt.Printf("%d 個のワーカーを起動します...\n", numWorkers)

	// 方法1: ループ前に Add する
	// wg.Add(numWorkers)
	// for i := 1; i <= numWorkers; i++ {
	// 	go worker(i, &wg) // worker 関数に i の値と wg のポインタを渡す
	// }

	// 方法2: ループ内で Add し、ループ変数を引数で渡す
	for i := 1; i <= numWorkers; i++ {
		wg.Add(1) // Goroutine を起動する直前にカウンターを増やす
		// go func() { ... }() で無名関数を Goroutine として起動
		go func(workerID int) { // ★ ループ変数 i の値を引数 workerID で受け取る
			defer wg.Done() // この Goroutine 終了時にカウンターを減らす

			fmt.Printf("ワーカー %d: 開始\n", workerID)
			time.Sleep(time.Duration(workerID) * 50 * time.Millisecond)
			fmt.Printf("ワーカー %d: 終了\n", workerID)
		}(i) // ★ ループの現在の i の値を引数として渡す
	}

	// 方法3: ループ内で Add し、ループ変数のコピーをクロージャで使う (Go 1.22 より前のイディオム)
	// for i := 1; i <= numWorkers; i++ {
	// 	wg.Add(1)
	// 	i := i // ★ ループの各反復で新しい変数 i を作成し、現在の値をコピー
	// 	go func() {
	// 		defer wg.Done()
	// 		fmt.Printf("ワーカー %d: 開始\n", i) // クロージャはこの内側の i をキャプチャ
	// 		time.Sleep(time.Duration(i) * 50 * time.Millisecond)
	// 		fmt.Printf("ワーカー %d: 終了\n", i)
	// 	}()
	// }

	fmt.Println("すべてのワーカーの終了を待機します...")
	wg.Wait() // カウンターが 0 になるまで待つ

	fmt.Println("すべてのワーカーが終了しました。")
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
5 個のワーカーを起動します...
すべてのワーカーの終了を待機します...
ワーカー 1: 開始
ワーカー 2: 開始
ワーカー 3: 開始
ワーカー 4: 開始
ワーカー 5: 開始
ワーカー 1: 終了
ワーカー 2: 終了
ワーカー 3: 終了
ワーカー 4: 終了
ワーカー 5: 終了
すべてのワーカーが終了しました。
*/
```

**コード解説:**

*   この例では「方法2」を採用しています。
*   `for i := 1; i <= numWorkers; i++`: 5回のループを実行します。
*   `wg.Add(1)`: ループの各反復で、これから起動する Goroutine のためにカウンターを 1 増やします。
*   `go func(workerID int) { ... }(i)`:
    *   無名関数を定義し、`go` で Goroutine として起動します。
    *   この無名関数は `workerID int` という引数を取ります。
    *   起動時に、ループ変数 `i` の**現在の値**を、この無名関数の引数 `workerID` に**コピーして渡して**います。
    *   Goroutine 内では、ループ変数 `i` ではなく、引数として受け取った `workerID` を使います。これにより、各 Goroutine は起動された時点での正しい `i` の値 (1, 2, 3, 4, 5) を使うことができます。
    *   `defer wg.Done()`: Goroutine の処理が完了したらカウンターを減らします。
*   `wg.Wait()`: すべての Goroutine が `Done()` を呼び出し、カウンターが 0 になるまで待ちます。

`sync.WaitGroup` は、複数の並行タスクを実行し、それらすべての完了を待つという一般的なシナリオで非常に役立ちます。ループ内で Goroutine を起動する際は、ループ変数の扱いに注意しましょう。