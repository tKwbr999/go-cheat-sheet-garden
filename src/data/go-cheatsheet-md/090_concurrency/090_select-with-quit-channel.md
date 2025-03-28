---
title: "並行処理: `select` と終了チャネル (Quit Channel)"
tags: ["concurrency", "channel", "goroutine", "select", "quit channel", "終了通知", "同期", "context"]
---

実行中の Goroutine に対して、外部から「もう処理を終了してほしい」と安全に通知したい場合があります。そのための古典的なパターンの一つが、**終了チャネル (Quit Channel / Done Channel / Stop Channel)** を使う方法です。

## 終了チャネルパターン

1.  **終了通知用のチャネルを作成:** 通常、空の構造体 `struct{}` のチャネル (`make(chan struct{})`) が使われます。空の構造体はメモリを消費せず、シグナルを送る目的に適しています。
2.  **Goroutine に終了チャネルを渡す:** 終了させたい Goroutine の関数に、この終了チャネル（通常は受信専用 `<-chan struct{}`）を引数として渡します。
3.  **Goroutine 内で `select` を使う:** Goroutine のメインループ内で `select` 文を使い、通常の処理（例: データチャネルからの受信）と**終了チャネルからの受信**を同時に待ち受けます。
    ```go
    select {
    case data := <-dataChan:
        // 通常のデータ処理
    case <-quitChan: // 終了チャネルから受信したら
        // クリーンアップ処理など
        return // Goroutine を終了
    }
    ```
4.  **終了を通知:** Goroutine を終了させたいタイミングで、呼び出し元（または別の Goroutine）が終了チャネルを**クローズ (`close(quitChan)`)** するか、あるいは**値を送信 (`quitChan <- struct{}{}`)** します。
    *   **クローズする**方法が一般的です。クローズされたチャネルからの受信は即座にゼロ値 (`struct{}{}`) と `false` を返すため、複数の Goroutine が同じ終了チャネルを待機している場合に、すべての Goroutine に終了をブロードキャストできます。
    *   値を送信する方法は、通常、特定の1つの Goroutine に終了を通知する場合に使われます。

## コード例

```go title="終了チャネルを使った Goroutine の停止"
package main

import (
	"fmt"
	"time"
)

// 終了通知を受け取るまで処理を続けるワーカー Goroutine
func worker(id int, dataChan <-chan string, quitChan <-chan struct{}) {
	fmt.Printf("ワーカー %d: 開始\n", id)
	for { // 無限ループ
		select {
		case data := <-dataChan: // データチャネルから受信
			fmt.Printf("ワーカー %d: データ '%s' を処理中...\n", id, data)
			time.Sleep(50 * time.Millisecond) // 処理をシミュレート
		case <-quitChan: // ★ 終了チャネルから受信 (またはクローズを検知)
			fmt.Printf("ワーカー %d: 終了シグナル受信、終了します。\n", id)
			// 必要であればクリーンアップ処理
			return // Goroutine を抜ける
		}
	}
}

func main() {
	dataChan := make(chan string)
	quitChan := make(chan struct{}) // 終了通知用チャネル (空の構造体)

	// ワーカー Goroutine を起動
	go worker(1, dataChan, quitChan)

	// いくつかデータを送信
	dataChan <- "データ A"
	dataChan <- "データ B"
	time.Sleep(200 * time.Millisecond) // ワーカーが処理するのを少し待つ

	// --- 終了を通知 ---
	fmt.Println("main: 終了シグナルを送信します (チャネルをクローズ)...")
	// ★ 終了チャネルをクローズすることで、待機しているすべての Goroutine に通知
	close(quitChan)
	// または、値を送信する場合: quitChan <- struct{}{}

	// Goroutine が終了するのを少し待つ (WaitGroup を使うのがより確実)
	time.Sleep(100 * time.Millisecond)
	fmt.Println("main: 終了")
}

/* 実行結果の例:
ワーカー 1: 開始
ワーカー 1: データ 'データ A' を処理中...
ワーカー 1: データ 'データ B' を処理中...
main: 終了シグナルを送信します (チャネルをクローズ)...
ワーカー 1: 終了シグナル受信、終了します。
main: 終了
*/
```

**コード解説:**

*   `quitChan := make(chan struct{})`: 終了通知用のチャネルを作成します。型は `struct{}` です。
*   `go worker(1, dataChan, quitChan)`: `worker` Goroutine にデータチャネルと終了チャネルを渡して起動します。
*   `worker` 関数内の `for { select { ... } }`: 無限ループの中で `select` を使います。
    *   `case data := <-dataChan:`: データチャネルから受信できれば、データを処理します。
    *   `case <-quitChan:`: 終了チャネル `quitChan` から受信できれば（またはチャネルがクローズされれば）、メッセージを出力して `return` し、Goroutine を終了します。
*   `close(quitChan)`: `main` 関数がワーカーに終了してほしいタイミングで、終了チャネルをクローズします。これにより、`worker` 内の `select` の `case <-quitChan:` が実行可能になり、Goroutine が終了します。

## `context` パッケージとの比較

終了チャネルパターンは Goroutine の停止を制御する基本的な方法ですが、より複雑なシナリオ（タイムアウト、キャンセル理由の伝達、複数の Goroutine への一括キャンセルなど）では、標準ライブラリの **`context`** パッケージを使う方がより強力で柔軟な制御が可能です。

`context` パッケージは、APIの境界を越えてリクエストスコープのデータ、キャンセルシグナル、デッドラインなどを伝達するための標準的な方法を提供します。新しいコードでは、特にライブラリやサーバーなどでは、終了チャネルよりも `context` を使うことが推奨されることが多いです。(`context` については後のセクションで詳しく説明します。)

しかし、単純なケースや内部的な実装においては、終了チャネルパターンも依然として有効な選択肢です。