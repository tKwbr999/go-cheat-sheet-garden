## タイトル
title: `select` 文による複数チャネル操作の待機

## タグ
tags: ["concurrency", "channel", "goroutine", "select", "case", "同期", "通信"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	// Goroutine 1: 1秒後に ch1 へ送信
	go func() { time.Sleep(1 * time.Second); ch1 <- "from 1" }()
	// Goroutine 2: 500ミリ秒後に ch2 へ送信
	go func() { time.Sleep(500 * time.Millisecond); ch2 <- "from 2" }()

	fmt.Println("受信待機中...")

	// select で ch1 または ch2 から受信可能な方を待つ
	select {
	case msg1 := <-ch1:
		fmt.Printf("ch1 受信: %s\n", msg1)
	case msg2 := <-ch2:
		fmt.Printf("ch2 受信: %s\n", msg2) // ch2 が先に準備できる
	}

	fmt.Println("最初のメッセージ受信完了")

	// (もう一方を受信するには再度 select や受信操作が必要)
	// msg := <-ch1 // 例
	// fmt.Println("残りを別途受信:", msg)
}

```

## 解説
```text
複数のチャネル送受信操作を**同時に待ち受け**、
最初に準備ができたものを実行するのが **`select`** 文です。
`switch` に似ていますが、`case` はチャネル操作を評価します。

**構文と動作:**
```go
select {
case 送受信操作1: // 例: value := <-chA
    // 操作1 が実行可能になった場合の処理
case 送受信操作2: // 例: chB <- data
    // 操作2 が実行可能になった場合の処理
// ...
default: // オプション
    // どの case もすぐに実行できない場合の処理
}
```
*   `select` は実行可能な `case` (ブロックしない送受信) が
    見つかるまで**ブロック**します。
*   複数の `case` が同時に実行可能な場合、**ランダムに一つ**選択。
*   選択された `case` の送受信操作と処理ブロックを実行し、`select` 終了。
*   `default` があるとブロックせず、実行可能な `case` がなければ
    `default` を実行 (ノンブロッキング)。

コード例では、2つの Goroutine が異なるタイミングで `ch1` と `ch2` に
送信します。`main` の `select` は両方のチャネルからの受信を待ちます。
`ch2` への送信が先に行われるため、`case msg2 := <-ch2:` が
選択・実行され、`select` は終了します。
(もう一方の `ch1` から受信するには、再度 `select` や受信操作が必要)

`select` は複数の Goroutine との通信や同期を調整する強力なツールです。