## タイトル
title: "sync.WaitGroup (再確認)"

## タグ
tags: ["concurrency", "goroutine", "sync", "WaitGroup", "同期", "Add", "Done", "Wait"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func task(id int, wg *sync.WaitGroup) {
	defer wg.Done() // タスク完了時にカウンターを減らす
	fmt.Printf("タスク %d: 開始\n", id)
	time.Sleep(time.Duration(id) * 100 * time.Millisecond) // 処理をシミュレート
	fmt.Printf("タスク %d: 完了\n", id)
}

func main() {
	var wg sync.WaitGroup // WaitGroup を宣言

	numTasks := 3
	fmt.Printf("%d 個のタスクを Goroutine で実行します...\n", numTasks)

	wg.Add(numTasks) // 待機する Goroutine の数を設定

	// Goroutine を起動
	go task(1, &wg)
	go task(2, &wg)
	go task(3, &wg)

	fmt.Println("すべてのタスクの完了を待機します...")
	wg.Wait() // カウンターが 0 になるまで待機

	fmt.Println("すべてのタスクが完了しました。")
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
3 個のタスクを Goroutine で実行します...
すべてのタスクの完了を待機します...
タスク 1: 開始
タスク 2: 開始
タスク 3: 開始
タスク 1: 完了
タスク 2: 完了
タスク 3: 完了
すべてのタスクが完了しました。
*/
```

## 解説
```text
`sync.WaitGroup` は、複数の Goroutine の完了を待ち合わせるための基本的な同期プリミティブです。

基本的な使い方や、ループで複数の Goroutine を起動する際の注意点については、以下のセクションで既に説明しました。

*   **「Goroutine の終了を待つ (`sync.WaitGroup`)」** (`090_concurrency/010_waiting-with-syncwaitgroup.md`)
*   **「複数の Goroutine と WaitGroup」** (`090_concurrency/020_multiple-goroutines-with-waitgroup.md`)

ここでは、その基本的な使い方を簡単な例で再確認します。

## `WaitGroup` の基本メソッド（再確認）

*   **`Add(delta int)`**: 待機する Goroutine の数をカウンターに追加します。
*   **`Done()`**: Goroutine が完了したときに呼び出し、カウンターを1減らします。通常 `defer wg.Done()` として使います。
*   **`Wait()`**: カウンターが 0 になるまで、呼び出し元の Goroutine をブロックします。

`sync.WaitGroup` は、複数の並行タスクを開始し、それらすべてが終了するのを待つという、非常に一般的なシナリオで使われる重要なツールです。