## タイトル
title: キャンセル可能な Context の生成 (`WithCancel`)

## タグ
tags: ["context", "concurrency", "WithCancel", "cancel", "キャンセル"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// キャンセルされるまで待機するワーカー
func watch(ctx context.Context, name string, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("%s: 開始\n", name)
	select {
	case <-ctx.Done(): // キャンセルを待つ
		fmt.Printf("%s: キャンセル (%v)\n", name, ctx.Err())
	}
}

func main() {
	var wg sync.WaitGroup
	rootCtx := context.Background()

	// キャンセル可能な Context を作成
	ctx1, cancel1 := context.WithCancel(rootCtx)
	defer cancel1() // ★ 必ず cancel を呼ぶ

	wg.Add(1)
	go watch(ctx1, "Watcher 1", &wg) // ctx1 を渡す

	// (ctx1 から派生した ctx2 を作成し、別の Goroutine に渡すことも可能)
	// ctx2, cancel2 := context.WithCancel(ctx1)
	// defer cancel2()
	// go watch(ctx2, "Watcher 2", &wg)

	time.Sleep(100 * time.Millisecond)

	fmt.Println("main: cancel1() 呼び出し...")
	cancel1() // ★ ctx1 をキャンセル (派生した ctx2 もキャンセルされる)

	wg.Wait() // Goroutine の終了を待つ
	fmt.Println("main: 終了")
}

```

## 解説
```text
処理のキャンセルを実現する基本が **`context.WithCancel`** です。

**`context.WithCancel` の基本:**
`ctx, cancel := context.WithCancel(parentCtx)`
*   親 Context `parentCtx` から派生した、キャンセル可能な
    新しい子 Context `ctx` と、それをキャンセルするための
    関数 `cancel` (`CancelFunc` 型) を返します。

**`cancel()` 関数の効果:**
`cancel()` を呼び出すと、
1. `ctx` の `Done()` チャネルがクローズされる。
2. `ctx` から派生した**すべての子孫 Context** の `Done()` も
   再帰的にクローズされる (**キャンセルの伝播**)。
3. `ctx` と子孫の `Err()` は `context.Canceled` を返すようになる。

**重要: `defer cancel()`**
`WithCancel` (や `WithTimeout`, `WithDeadline`) で Context を
生成したら、関連処理完了後に**必ず `cancel()` を呼ぶ**
必要があります (通常 `defer cancel()`)。
これにより Context 関連リソースが解放されます。

コード例:
1. `context.WithCancel` で `ctx1` と `cancel1` を作成。
2. `defer cancel1()` で `main` 終了時の呼び出しを保証。
3. `watch` Goroutine に `ctx1` を渡す。`watch` は `ctx.Done()` を待つ。
4. `main` が `cancel1()` を呼び出す。
5. `ctx1` の `Done()` がクローズされ、`watch` Goroutine が
   キャンセルを検知して終了する。
6. (もし `ctx1` から派生した `ctx2` があれば、それも同時にキャンセルされる)

`context.WithCancel` は、処理中断シグナルを関係する
Goroutine に伝播させるための基本要素です。