---
title: "並行処理: ノンブロッキング `select` (`default` ケース)"
tags: ["concurrency", "channel", "goroutine", "select", "default", "ノンブロッキング"]
---

通常の `select` 文は、いずれかの `case` のチャネル操作が実行可能になるまでブロックします。しかし、`select` 文に **`default`** ケースを追加すると、その動作が変わります。

## `default` ケースを持つ `select` の動作

`select` 文に `default` ケースが存在する場合：

1.  `select` は、まず他の `case` のチャネル送受信操作が**すぐに**実行可能かどうかをチェックします。
2.  もし、いずれかの `case` がすぐに実行可能であれば、その `case` が（複数の候補があればランダムに）選択され、実行されます。`default` ケースは実行されません。
3.  もし、どの `case` も**すぐに**実行できない（つまり、実行するとブロックしてしまう）場合、**`default` ケースが選択され、実行されます**。`select` 文はブロックしません。

これにより、チャネル操作を**ブロックせずに行う（ノンブロッキング操作）**ことが可能になります。

## ユースケース

*   **ノンブロッキング受信:** チャネルから受信を試みるが、もし受信できる値がなければ、待たずに別の処理を行いたい場合。
*   **ノンブロッキング送信:** チャネルに送信を試みるが、もしチャネルのバッファが一杯で（または受信側がいなくて）すぐに送信できなければ、待たずに別の処理を行いたい場合。
*   **複数のチャネルをポーリング:** 複数のチャネルのうち、現在準備ができているものがあれば処理し、なければ別のことをする場合。

## コード例

```go title="ノンブロッキングなチャネル操作"
package main

import (
	"fmt"
	"time"
)

func main() {
	messages := make(chan string) // バッファなしチャネル
	signals := make(chan bool)   // バッファなしチャネル

	// --- ノンブロッキング受信 ---
	fmt.Println("--- ノンブロッキング受信 ---")
	// messages チャネルはまだ空なので、受信しようとするとブロックするはず
	select {
	case msg := <-messages:
		fmt.Println("メッセージ受信:", msg)
	default: // ★ どの case もすぐに実行できないので default が実行される
		fmt.Println("受信できるメッセージはありません。")
	}

	// --- ノンブロッキング送信 ---
	fmt.Println("\n--- ノンブロッキング送信 ---")
	msgToSend := "こんにちは"
	// messages チャネルには受信側がいないので、送信しようとするとブロックするはず
	select {
	case messages <- msgToSend: // 送信を試みる
		fmt.Printf("メッセージ '%s' を送信しました。\n", msgToSend)
	default: // ★ 送信がすぐにできないので default が実行される
		fmt.Printf("メッセージ '%s' を送信できませんでした (ブロックするため)。\n", msgToSend)
	}

	// --- 複数のチャネルに対するノンブロッキング操作 ---
	fmt.Println("\n--- 複数チャネルのノンブロッキング操作 ---")
	// この時点では messages も signals も送受信できない
	select {
	case msg := <-messages:
		fmt.Println("メッセージ受信:", msg)
	case sig := <-signals:
		fmt.Println("シグナル受信:", sig)
	default: // ★ どちらの case もすぐに実行できないので default が実行される
		fmt.Println("現在、利用可能なアクティビティはありません。")
	}

	// --- 受信可能な場合 ---
	fmt.Println("\n--- 受信可能な場合 ---")
	go func() { time.Sleep(50*time.Millisecond); messages <- "データあり" }() // 少し遅れて送信
	time.Sleep(100*time.Millisecond) // Goroutine が送信するのを待つ

	select {
	case msg := <-messages: // ★ 今度は受信できるので、こちらが実行される
		fmt.Println("メッセージ受信:", msg)
	default:
		fmt.Println("受信できるメッセージはありません。")
	}
}

/* 実行結果:
--- ノンブロッキング受信 ---
受信できるメッセージはありません。

--- ノンブロッキング送信 ---
メッセージ 'こんにちは' を送信できませんでした (ブロックするため)。

--- 複数チャネルのノンブロッキング操作 ---
現在、利用可能なアクティビティはありません。

--- 受信可能な場合 ---
メッセージ受信: データあり
*/
```

**コード解説:**

*   最初の「ノンブロッキング受信」では、`messages` チャネルは空なので `<-messages` はブロックします。そのため `default` が実行されます。
*   次の「ノンブロッキング送信」では、`messages` チャネルには受信側がいない（かつバッファもない）ため `messages <- msgToSend` はブロックします。そのため `default` が実行されます。
*   「複数チャネルのノンブロッキング操作」でも、`messages` と `signals` のどちらもすぐに送受信できないため `default` が実行されます。
*   最後の「受信可能な場合」では、Goroutine が `messages` に値を送信した後なので、`select` 実行時には `<-messages` がすぐに実行可能です。そのため、`default` ではなく `case msg := <-messages:` が実行されます。

`select` の `default` ケースは、チャネル操作がブロックする可能性がある場合に、ブロックを回避して別の処理を行いたい、あるいは現在のチャネルの状態を確認したい（ポーリング）といった状況で役立ちます。