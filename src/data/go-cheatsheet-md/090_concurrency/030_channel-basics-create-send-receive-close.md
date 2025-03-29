## タイトル
title: チャネル (Channel) の基本

## タグ
tags: ["concurrency", "channel", "goroutine", "make", "<-", "close", "同期", "通信", "バッファ"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// バッファなしチャネル作成
	ch1 := make(chan string)

	go func() {
		fmt.Println("Goroutine: 送信開始")
		ch1 <- "Hello" // 送信 (受信側が待つまでブロックする可能性)
		fmt.Println("Goroutine: 送信完了")
		time.Sleep(50 * time.Millisecond)
		ch1 <- "World"
		fmt.Println("Goroutine: 送信完了、クローズ")
		close(ch1) // ★ 送信側がクローズ
	}()

	fmt.Println("main: 受信待機...")
	msg1 := <-ch1 // 受信 (送信されるまでブロックする可能性)
	fmt.Printf("main: 受信1: %s\n", msg1)
	msg2 := <-ch1 // 再度受信
	fmt.Printf("main: 受信2: %s\n", msg2)

	// クローズ後の受信確認
	msg3, ok := <-ch1
	if !ok {
		fmt.Printf("main: 受信3: クローズ済み (値:%q, ok:%t)\n", msg3, ok)
	}
	// close(ch1) // 再クローズは panic
	// ch1 <- "Bye" // クローズ後送信は panic
}

```

## 解説
```text
Goroutine間の情報交換や同期には**チャネル (Channel)** を使います。

**チャネルとは？**
*   **型付き通信路:** 特定型の値をGoroutine間で安全に送受信するパイプ。
*   **同期メカニズム:** 送受信操作はデフォルトでブロックする可能性があり、同期に使われる。

**作成: `make(chan 型, [容量])`**
*   **バッファなし (`make(chan T)`)**:
    *   送信は受信準備完了までブロック。
    *   受信は送信実行までブロック。
    *   送受信が同時に行われ同期が保証される。
*   **バッファあり (`make(chan T, capacity)`)**:
    *   容量 `capacity` まで値を一時保持。
    *   送信はバッファ満杯までブロックしない。
    *   受信はバッファ空までブロックしない。
    *   非同期的な通信が可能。

**送受信: `<-` 演算子**
*   **送信:** `チャネル <- 値`
*   **受信:** `変数 := <-チャネル` (式 `<-チャネル` も可)

**クローズ: `close()`**
送信完了を示すために**送信側**がチャネルをクローズします。
`close(チャネル変数)`
*   クローズ後の送信は **panic**。
*   クローズ後の受信は、バッファが空になるまで値が返り、
    その後は**ゼロ値**が即座に返る。
*   **クローズ状態確認:** カンマOKイディオム
    `value, ok := <-ch`
    *   チャネルが開いていて値受信: `ok` は `true`。
    *   チャネルがクローズされバッファ空: `ok` は **`false`**。

コード例ではバッファなしチャネル `ch1` を使い、Goroutineが値を送信し、
`main` が受信しています。`close(ch1)` 後に受信すると `ok` が `false` になります。

チャネルはGoの並行処理の核となる機能です。