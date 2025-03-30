## タイトル
title: 共有メモリの保護 (`sync.Mutex`)

## タグ
tags: ["concurrency", "goroutine", "sync", "Mutex", "相互排他ロック", "競合状態", "Race Condition", "Lock", "Unlock", "defer"]

## コード
```go
package main

import (
	"fmt"
	"sync"
)

var mu sync.Mutex // 共有カウンターを保護する Mutex

// Mutex を使って安全にカウンターをインクリメント
func safeIncrement(wg *sync.WaitGroup, counter *int) {
	defer wg.Done()

	mu.Lock() // ロック獲得
	// ★ defer で必ず Unlock する
	defer mu.Unlock()

	// Lock と Unlock の間は一度に1つの Goroutine のみ実行可能
	*counter = *counter + 1
}

func main() {
	var wg sync.WaitGroup
	iterations := 1000
	safeCounter := 0

	fmt.Println("--- Mutex あり ---")
	wg.Add(iterations)
	for i := 0; i < iterations; i++ {
		go safeIncrement(&wg, &safeCounter)
	}
	wg.Wait()
	// 常に期待値になる
	fmt.Printf("最終カウンター: %d (期待値: %d)\n", safeCounter, iterations)

	// 競合検出: go run -race main.go
}

```

## 解説
```text
複数の Goroutine が同じ変数に同時に書き込み/読み書きすると
**競合状態 (Race Condition)** が発生し、予期せぬ動作や
データ破損の原因になります。

これを防ぐ基本的な同期プリミティブが **`sync.Mutex`**
(相互排他ロック) です。`import "sync"` で利用します。

**`sync.Mutex` とは？**
*   一度に**一つの Goroutine だけ**が特定のコード領域
    (クリティカルセクション) を実行できるようにするロック。
*   共有リソースアクセス前に `Lock()` し、後に `Unlock()` する。
*   ロック獲得中に他の Goroutine が `Lock()` するとブロックされる。

**使い方:**
1. 保護対象と一緒に `var mu sync.Mutex` を宣言。
2. 共有リソースアクセス直前に `mu.Lock()`。
3. **`defer mu.Unlock()`** で関数の最後に必ず解放する (最重要)。
   Unlock 忘れはデッドロックの原因。
4. `Lock()` と `Unlock()` の間で共有リソースにアクセス。

コード例の `safeIncrement` では、`mu.Lock()` と `defer mu.Unlock()` で
`*counter = *counter + 1` の操作を保護しています。
これにより、複数の Goroutine から呼び出されても、カウンターの
インクリメントは一度に一つずつ安全に行われ、最終結果は
常に期待通り (1000) になります。

**(比較)** もし Mutex を使わないと (`*counter = *counter + 1` のみ)、
読み取り・加算・書き込みの間に他の Goroutine が割り込み、
加算が失われる競合が発生し、結果が期待値より少なくなる可能性があります。

**競合検出器 (`-race`):**
`go run -race main.go` や `go test -race ./...` で実行すると、
競合状態を検出して報告してくれます。開発中は利用を推奨します。

`sync.Mutex` は共有リソースへのアクセスを安全にする基本です。
競合を防ぐために適切に利用しましょう。