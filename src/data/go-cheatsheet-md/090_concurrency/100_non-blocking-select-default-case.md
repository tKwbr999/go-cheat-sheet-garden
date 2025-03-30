## タイトル
title: ノンブロッキング `select` (`default` ケース)

## タグ
tags: ["concurrency", "channel", "goroutine", "select", "default", "ノンブロッキング"]

## コード
```go
package main

import "fmt"

func main() {
	messages := make(chan string) // バッファなし
	msgToSend := "Hi"

	// ノンブロッキング受信
	// messages は空なので受信はブロックするはず
	select {
	case msg := <-messages:
		fmt.Println("受信:", msg)
	default: // ★ 他の case がブロックするので default が実行される
		fmt.Println("受信メッセージなし")
	}

	// ノンブロッキング送信
	// messages に受信側がいないので送信はブロックするはず
	select {
	case messages <- msgToSend:
		fmt.Println("送信成功:", msgToSend)
	default: // ★ 他の case がブロックするので default が実行される
		fmt.Println("送信失敗 (ブロックするため)")
	}

	// 受信を試みる (ノンブロッキング)
	// この時点でも受信できないので default が実行される
	select {
	case msg := <-messages:
		fmt.Println("受信:", msg)
	default:
		fmt.Println("再度受信試行: 受信メッセージなし")
	}
}

```

## 解説
```text
通常の `select` は実行可能な `case` が現れるまでブロックしますが、
**`default`** ケースを追加すると動作が変わります。

**`default` ケースを持つ `select`:**
1. 他の `case` のチャネル操作が**すぐに**実行可能かチェック。
2. すぐに実行可能な `case` があれば、それを実行 (複数あればランダム)。
3. どの `case` もすぐに実行できない (ブロックする) 場合、
   **`default` ケースを実行**。`select` 文はブロックしない。

これにより、チャネル操作を**ブロックせずに行う
(ノンブロッキング操作)** ことが可能です。

**ユースケース:**
*   **ノンブロッキング受信:** 受信できなければ待たずに別処理。
*   **ノンブロッキング送信:** 送信できなければ待たずに別処理。
*   **複数チャネルポーリング:** 準備ができているチャネルがあれば処理、
    なければ別処理。

コード例:
*   最初の `select` (受信): `messages` は空なので `default` 実行。
*   次の `select` (送信): 受信側がいないので `default` 実行。
*   最後の `select` (受信): 依然 `messages` は空なので `default` 実行。

もし Goroutine が `messages` に値を送信した後であれば、
受信の `select` は `case msg := <-messages:` を実行します。

`select` の `default` は、チャネル操作のブロックを回避したり、
チャネルの状態をポーリングしたりする場合に役立ちます。