---
title: "並行処理: `for range` によるチャネルからの受信"
tags: ["concurrency", "channel", "goroutine", "for range", "close", "ループ"]
---

チャネルから値を繰り返し受信する場合、`for` ループとカンマOKイディオム (`value, ok := <-ch`) を使ってチャネルがクローズされたかを確認する方法もありますが、より簡潔で一般的な方法として **`for range`** ループを使うことができます。

## チャネルに対する `for range`

チャネル `ch` に対して `for range` ループを使うと、以下の動作になります。

*   **構文:** `for value := range ch { ... }`
*   チャネル `ch` から値が送信されるたびに、その値がループ変数 `value` に代入され、ループ本体が実行されます。
*   チャネル `ch` が**クローズ (close)** されると、バッファに残っている値があればそれらをすべて受信し終えた後、ループは**自動的に終了**します。

**重要なポイント:** このループが正しく終了するためには、どこかの Goroutine（通常は送信側）が最終的にチャネルを `close()` する必要があります。`close()` されないチャネルに対して `for range` を使うと、ループは永遠に受信待ちとなり、デッドロックを引き起こす可能性があります。

```go title="for range によるチャネル受信"
package main

import (
	"fmt"
	"time"
)

// 指定された数のメッセージをチャネルに送信し、最後にチャネルをクローズする関数
func produceMessages(count int, ch chan<- string) { // chan<- は送信専用チャネルを示す (オプション)
	fmt.Println("Producer: 開始")
	for i := 1; i <= count; i++ {
		message := fmt.Sprintf("メッセージ %d", i)
		fmt.Printf("Producer: '%s' を送信中...\n", message)
		ch <- message // チャネルに送信
		time.Sleep(100 * time.Millisecond)
	}
	fmt.Println("Producer: すべて送信完了。チャネルをクローズします。")
	close(ch) // ★ 送信完了後、チャネルをクローズ
}

func main() {
	// string 型のチャネルを作成 (バッファなし)
	messageChannel := make(chan string)

	// Goroutine でメッセージを生成・送信
	go produceMessages(5, messageChannel)

	fmt.Println("Consumer (main): チャネルからの受信を開始します (for range)...")

	// ★ for range を使ってチャネルから値を受信 ★
	// このループは messageChannel がクローズされるまで続く
	for msg := range messageChannel {
		// チャネルから値を受信するたびにループ本体が実行される
		fmt.Printf("Consumer (main): 受信: '%s'\n", msg)
	}

	// ループが終了するのは、チャネルがクローズされ、
	// かつバッファが空になった後 (この例ではバッファなしなのでクローズ直後)
	fmt.Println("Consumer (main): チャネルがクローズされたため、ループを終了しました。")

	// クローズされたチャネルに対して再度 for range を実行しても、ループはすぐに終了する
	fmt.Println("\nクローズ済みチャネルで再度 for range:")
	for msg := range messageChannel {
		fmt.Printf("これは実行されないはず: %s\n", msg)
	}
	fmt.Println("ループは実行されませんでした。")
}

/* 実行結果の例 (Goroutine のタイミングで多少前後する可能性あり):
Consumer (main): チャネルからの受信を開始します (for range)...
Producer: 開始
Producer: 'メッセージ 1' を送信中...
Consumer (main): 受信: 'メッセージ 1'
Producer: 'メッセージ 2' を送信中...
Consumer (main): 受信: 'メッセージ 2'
Producer: 'メッセージ 3' を送信中...
Consumer (main): 受信: 'メッセージ 3'
Producer: 'メッセージ 4' を送信中...
Consumer (main): 受信: 'メッセージ 4'
Producer: 'メッセージ 5' を送信中...
Consumer (main): 受信: 'メッセージ 5'
Producer: すべて送信完了。チャネルをクローズします。
Consumer (main): チャネルがクローズされたため、ループを終了しました。

クローズ済みチャネルで再度 for range:
ループは実行されませんでした。
*/
```

**コード解説:**

*   `produceMessages` 関数は、指定された回数だけメッセージをチャネル `ch` に送信し、最後に `close(ch)` でチャネルをクローズします。
*   `main` 関数では、`produceMessages` を Goroutine として起動した後、`for msg := range messageChannel { ... }` でチャネルからの受信を開始します。
*   `produceMessages` がチャネルに値を送信するたびに、`for range` ループがその値を受け取り、`fmt.Printf` を実行します。
*   `produceMessages` が `close(messageChannel)` を呼び出すと、`for range` ループはそれ以上新しい値を受信しないことを認識し、ループを終了します。
*   ループ終了後、「チャネルがクローズされたため、ループを終了しました。」というメッセージが表示されます。

`for range` は、チャネルから送信される一連の値を処理するための、非常に簡潔で一般的な方法です。ただし、ループが適切に終了するように、送信側がチャネルを `close` することを忘れないように注意が必要です。