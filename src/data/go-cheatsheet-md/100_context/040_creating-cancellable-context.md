---
title: "Context パッケージ: キャンセル可能な Context の生成 (`WithCancel`)"
tags: ["context", "concurrency", "WithCancel", "cancel", "キャンセル"]
---

`context` パッケージを使って処理のキャンセルを実現する基本的な方法が、**`context.WithCancel`** 関数を使うことです。

`WithCancel` の使い方や、返される `cancel` 関数の重要性については、**「並行処理」**セクションの以下の項目で既に説明しました。

*   **「Context の生成 (`context` パッケージ)」** (`090_concurrency/190_creating-contexts.md`)
*   **「Context による明示的なキャンセル」** (`090_concurrency/220_context-cancellation.md`)

ここでは、その基本的な使い方を再確認します。

## `context.WithCancel` の基本（再確認）

*   **`context.WithCancel(parent Context) (ctx Context, cancel CancelFunc)`**:
    *   親 Context (`parent`) を受け取り、新しい子 Context (`ctx`) と、その `ctx` をキャンセルするための関数 (`cancel`) を返します。
    *   `cancel()` を呼び出すと、`ctx` とその子孫 Context の `Done()` チャネルがクローズされます。
*   **`defer cancel()`**: 返された `cancel` 関数は、関連する処理が完了した時点で**必ず呼び出す**必要があります。リソースリークを防ぐために `defer` を使うのが定石です。

```go title="WithCancel の基本的な使い方"
package main

import (
	"context"
	"fmt"
	"time"
)

// Context を受け取り、キャンセルされるまで待機する関数
func watch(ctx context.Context, name string) {
	select {
	case <-ctx.Done(): // Context のキャンセルを待つ
		fmt.Printf("%s: キャンセルされました (%v)\n", name, ctx.Err())
	}
}

func main() {
	// ルート Context
	rootCtx := context.Background()

	// キャンセル可能な子 Context を作成
	ctx1, cancel1 := context.WithCancel(rootCtx)
	// ★ defer で cancel1 を呼び出す
	defer cancel1()

	// Goroutine で watch を実行
	go watch(ctx1, "Watcher 1")

	// さらに ctx1 から派生した子 Context を作成
	ctx2, cancel2 := context.WithCancel(ctx1)
	// ★ defer で cancel2 を呼び出す
	defer cancel2()

	go watch(ctx2, "Watcher 2 (ctx1 の子)")

	// 少し待機
	time.Sleep(100 * time.Millisecond)

	// --- キャンセルを実行 ---
	fmt.Println("main: cancel1() を呼び出します...")
	cancel1() // ★ ctx1 をキャンセル -> ctx2 も自動的にキャンセルされる

	// キャンセルが Goroutine に伝わるのを少し待つ
	time.Sleep(50 * time.Millisecond)
	fmt.Println("main: 終了")
}

/* 実行結果の例:
main: cancel1() を呼び出します...
Watcher 1: キャンセルされました (context canceled)
Watcher 2 (ctx1 の子): キャンセルされました (context canceled)
main: 終了
*/
```

**コード解説:**

*   `ctx1, cancel1 := context.WithCancel(rootCtx)` でキャンセル可能な Context `ctx1` を作成します。
*   `ctx2, cancel2 := context.WithCancel(ctx1)` で `ctx1` からさらに派生した `ctx2` を作成します。
*   `defer cancel1()` と `defer cancel2()` で、それぞれの `cancel` 関数が `main` 関数終了時に呼ばれるようにします。
*   `go watch(ctx1, ...)` と `go watch(ctx2, ...)` で、それぞれの Context を監視する Goroutine を起動します。
*   `cancel1()` を呼び出すと、`ctx1` がキャンセルされ、その `Done()` チャネルがクローズされます。
*   `ctx2` は `ctx1` から派生しているため、親である `ctx1` がキャンセルされると `ctx2` も**自動的にキャンセル**され、その `Done()` チャネルもクローズされます。
*   結果として、両方の `watch` Goroutine が `<-ctx.Done()` を検知し、キャンセルメッセージを出力して終了します。

`context.WithCancel` は、処理の途中で中断が必要になる可能性がある場合に、そのキャンセルシグナルを関係する Goroutine に伝播させるための基本的な構成要素です。