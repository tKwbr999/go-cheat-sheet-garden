## タイトル
title: 並行処理: `for range` によるチャネルからの受信

## タグ
tags: ["concurrency", "channel", "goroutine", "for range", "close", "ループ"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// メッセージを送信し、最後にチャネルをクローズする関数
func produceMessages(count int, ch chan<- string) {
	fmt.Println("Producer: 開始")
	for i := 1; i <= count; i++ {
		msg := fmt.Sprintf("Msg %d", i)
		fmt.Printf("Producer: 送信 '%s'\n", msg)
		ch <- msg
		time.Sleep(50 * time.Millisecond)
	}
	fmt.Println("Producer: クローズ")
	close(ch) // ★ 送信完了後にクローズ
}

func main() {
	messageChannel := make(chan string)
	go produceMessages(3, messageChannel) // Goroutine で送信

	fmt.Println("Consumer: 受信開始 (for range)...")
	// ★ for range でチャネルから受信
	// チャネルがクローズされるまでループが続く
	for msg := range messageChannel {
		fmt.Printf("Consumer: 受信 '%s'\n", msg)
	}
	fmt.Println("Consumer: ループ終了 (チャネルクローズ)")
}

```

## 解説
```text
チャネルから値を繰り返し受信するには、
**`for range`** ループを使うのが簡潔で一般的です。

**チャネルに対する `for range`:**
*   **構文:** `for value := range ch { ... }`
*   チャネル `ch` から値が送信されるたびに、`value` に
    代入されループ本体が実行されます。
*   チャネル `ch` が**クローズ (`close`)** されると、
    (バッファが空になった後) ループは**自動的に終了**します。

**重要:** ループが正しく終了するには、どこかの Goroutine
(通常は送信側) が最終的にチャネルを `close()` する必要があります。
`close()` されないチャネルに `for range` を使うと、
永遠に受信待ちとなりデッドロックする可能性があります。

コード例では、`produceMessages` Goroutine がメッセージを送信し、
最後に `close(messageChannel)` を呼び出します。
`main` Goroutine の `for msg := range messageChannel` は、
チャネルからメッセージを受信するたびに `Printf` を実行し、
チャネルがクローズされると自動的にループを終了します。

`for range` はチャネルからの連続的な値の受信処理に便利ですが、
必ず送信側で `close` するように注意しましょう。