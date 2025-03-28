---
title: "制御構文: `for range` ループ (チャネル)"
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "チャネル", "channel", "並行処理", "close"]
---

`for range` ループは、Goの並行処理機能の中心的な要素である**チャネル (Channel)** から値を繰り返し受信するためにも使われます。

## チャネルとは？

チャネルは、異なる **Goroutine** (Goが軽量に実行する並行処理の単位) 間でデータを安全に送受信するための通信路です。一方の Goroutine がチャネルに値を送信 (`ch <- value`) し、もう一方の Goroutine がチャネルから値を受信 (`value := <-ch`) します。（チャネルと Goroutine の詳細は後のセクションで詳しく学びます）

## チャネルでの `for range`

チャネルに対して `for range` を使うと、そのチャネルから値が送信されるたびに、その値をループ変数で受け取ることができます。配列やスライス、マップとは異なり、チャネルの場合は**値のみ**が返されます（インデックスはありません）。

**構文:** `for 値変数 := range チャネル { ... ループ本体 ... }`

**重要なポイント:** チャネルに対する `for range` ループは、そのチャネルが**クローズ (close)** されるまで値を受信し続けます。チャネルがクローズされると、ループは自動的に終了します。もしチャネルがクローズされない場合、`for range` は永遠に値の受信を待ち続け、プログラムがデッドロック（停止）する可能性があります。

```go title="チャネルでの for range"
package main

import (
	"fmt"
	"time"
)

func main() {
	// int 型の値を送受信できるチャネルを作成 (バッファなし)
	// make(chan 型) でチャネルを作成
	messageChannel := make(chan int)

	// 別の Goroutine を起動してチャネルに値を送信する
	go func() {
		fmt.Println("送信 Goroutine: 開始")
		for i := 1; i <= 5; i++ {
			fmt.Printf("送信 Goroutine: %d を送信中...\n", i)
			messageChannel <- i // チャネルに値を送信
			time.Sleep(500 * time.Millisecond) // 少し待機
		}
		fmt.Println("送信 Goroutine: すべて送信完了。チャネルをクローズします。")
		// ★重要: 送信が完了したらチャネルをクローズする
		close(messageChannel)
	}()

	fmt.Println("受信 Goroutine (main): チャネルからの受信を開始します...")

	// for range を使ってチャネルから値を受信する
	// このループは messageChannel がクローズされるまで続く
	for value := range messageChannel {
		fmt.Printf("受信 Goroutine (main): %d を受信しました。\n", value)
	}

	// ループが終了するのは、チャネルがクローズされた後
	fmt.Println("受信 Goroutine (main): チャネルがクローズされたため、ループを終了しました。")
}

/* 実行結果 (Goroutine の実行タイミングにより多少前後する可能性あり):
受信 Goroutine (main): チャネルからの受信を開始します...
送信 Goroutine: 開始
送信 Goroutine: 1 を送信中...
受信 Goroutine (main): 1 を受信しました。
送信 Goroutine: 2 を送信中...
受信 Goroutine (main): 2 を受信しました。
送信 Goroutine: 3 を送信中...
受信 Goroutine (main): 3 を受信しました。
送信 Goroutine: 4 を送信中...
受信 Goroutine (main): 4 を受信しました。
送信 Goroutine: 5 を送信中...
受信 Goroutine (main): 5 を受信しました。
送信 Goroutine: すべて送信完了。チャネルをクローズします。
受信 Goroutine (main): チャネルがクローズされたため、ループを終了しました。
*/
```

**コード解説:**

*   `messageChannel := make(chan int)`: `int` 型の値を送受信するためのチャネルを作成します。
*   `go func() { ... }()`: 新しい Goroutine を起動し、その中でチャネルへの送信処理を行っています。
*   `messageChannel <- i`: `i` の値をチャネルに送信します。
*   `close(messageChannel)`: チャネルへの値の送信がすべて完了したことを示すために、チャネルを**クローズ**します。`for range` ループが終了するためには、チャネルがクローズされることが不可欠です。
*   `for value := range messageChannel { ... }`: `main` Goroutine 側で、`messageChannel` から値が送信されてくるのを待ち受けます。値が送信されるたびにループ本体が実行され、`value` に受信した値が代入されます。チャネルがクローズされると、このループは自動的に終了します。

チャネルに対する `for range` は、Goroutine 間で複数のデータを順番に処理する際の基本的なパターンです。チャネルを適切にクローズすることが、ループを正しく終了させる鍵となります。