## タイトル
title: 並行処理: `select` と終了チャネル (Quit Channel)

## タグ
tags: ["concurrency", "channel", "goroutine", "select", "quit channel", "終了通知", "同期", "context"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// 終了通知を受け取るまで処理を続けるワーカー
func worker(id int, dataChan <-chan string, quitChan <-chan struct{}) {
	fmt.Printf("Worker %d: 開始\n", id)
	for {
		select {
		case data := <-dataChan:
			fmt.Printf("Worker %d: 処理 '%s'\n", id, data)
			time.Sleep(50 * time.Millisecond)
		case <-quitChan: // ★ 終了チャネルから受信 (またはクローズ検知)
			fmt.Printf("Worker %d: 終了シグナル受信\n", id)
			return // Goroutine 終了
		}
	}
}

func main() {
	dataChan := make(chan string)
	quitChan := make(chan struct{}) // 終了通知用チャネル

	go worker(1, dataChan, quitChan) // ワーカー起動

	dataChan <- "データ A"
	dataChan <- "データ B"
	time.Sleep(200 * time.Millisecond)

	fmt.Println("main: 終了シグナル送信 (close)")
	close(quitChan) // ★ チャネルをクローズして終了を通知

	time.Sleep(100 * time.Millisecond) // 終了を待つ (WaitGroup推奨)
	fmt.Println("main: 終了")
}

```

## 解説
```text
実行中の Goroutine に外部から安全に終了を通知する古典的な
パターンが**終了チャネル (Quit Channel)** です。

**パターン:**
1. **終了チャネル作成:** 通常 `make(chan struct{})` を使う
   (空構造体はメモリ消費ゼロ)。
2. **Goroutine へ渡す:** 終了させたい Goroutine に引数
   (通常 `<-chan struct{}`) として渡す。
3. **`select` で待機:** Goroutine 内のループで `select` を使い、
   通常の処理用チャネルと**終了チャネルからの受信**を待つ。
   ```go
   select {
   case data := <-dataChan: // 通常処理
       // ...
   case <-quitChan: // 終了チャネルから受信したら
       // クリーンアップ等
       return // Goroutine 終了
   }
   ```
4. **終了通知:** 呼び出し元が終了チャネルを**クローズ (`close`)** する
   (一般的、複数 Goroutine に通知可) か、値を送信する
   (`quitChan <- struct{}{}`)。

コード例では、`worker` Goroutine が `select` で `dataChan` と
`quitChan` を待機します。`main` が `close(quitChan)` すると、
`worker` の `case <-quitChan:` が実行され、`return` して終了します。

**`context` パッケージとの比較:**
終了チャネルは単純なケースで有効ですが、タイムアウト、
キャンセル理由伝達、複数 Goroutine への一括キャンセルなど、
より複雑なシナリオでは標準ライブラリの **`context`** パッケージを
使う方が強力で推奨されます (後述)。