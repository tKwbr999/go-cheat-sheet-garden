## タイトル
title: `for range` ループ (チャネル)

## タグ
tags: ["flow-control", "for", "for range", "ループ", "繰り返し", "チャネル", "channel", "並行処理", "close"]

## コード
```go
package main

import (
	"fmt"
	"time" // 説明のため短時間スリープさせるのに使用
)

func main() {
	messageChannel := make(chan int)

	// 別 Goroutine で値を送信
	go func() {
		for i := 1; i <= 3; i++ {
			fmt.Printf("送信: %d\n", i)
			messageChannel <- i
			time.Sleep(10 * time.Millisecond) // 送受信の様子を見るため少し待つ
		}
		close(messageChannel) // ★重要: 送信完了後にクローズ
		fmt.Println("送信側: チャネルクローズ完了")
	}()

	fmt.Println("受信側: ループ開始")
	// チャネルから値を受信 (チャネルがクローズされるまで)
	for value := range messageChannel {
		fmt.Printf("受信: %d\n", value)
	}
	fmt.Println("受信側: ループ終了 (チャネルクローズのため)")
}

```

## 解説
```text
`for range` ループは、**チャネル (Channel)** から
値を繰り返し受信するためにも使われます。
チャネルは Goroutine (軽量な並行処理単位) 間で
データを送受信するための通信路です。

**チャネルでの `for range`:**
`for 値変数 := range チャネル { ... }`
チャネルから値が送信されるたびに、その値を
ループ変数で受け取ります (値のみ、インデックスなし)。

**重要: チャネルのクローズ**
チャネルに対する `for range` ループは、
そのチャネルが**クローズ (`close(ch)`)** されるまで
値を受信し続けます。
チャネルがクローズされると、ループは自動的に終了します。

もしチャネルがクローズされない場合、`for range` は
永遠に値の受信を待ち続け、プログラムが
**デッドロック (停止)** する可能性があります。

コード例では、別 Goroutine がチャネルに値を送信し、
送信完了後に `close(messageChannel)` を呼び出しています。
`main` Goroutine の `for range` は、チャネルから
すべての値を受信し、チャネルがクローズされたことで
正常に終了します。

チャネルに対する `for range` は、Goroutine 間で
複数のデータを順番に処理する際の基本的なパターンであり、
**送信側での適切なチャネルのクローズ**が不可欠です。