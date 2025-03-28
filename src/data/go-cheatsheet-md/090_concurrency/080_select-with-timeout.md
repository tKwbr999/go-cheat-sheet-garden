---
title: "並行処理: `select` によるタイムアウト処理"
tags: ["concurrency", "channel", "goroutine", "select", "timeout", "time.After", "同期"]
---

チャネル操作（特にバッファなしチャネルや空のバッファありチャネルからの受信）は、相手側の準備ができるまでブロックする可能性があります。しかし、外部リソースへのアクセスや時間のかかる処理を待つ際に、無期限に待ち続けるのではなく、一定時間経過したら処理を中断（タイムアウト）したい場合があります。

`select` 文を使うと、このようなタイムアウト処理を簡単に実装できます。

## `time.After` によるタイムアウト

`time` パッケージの **`After`** 関数を使います。

**`time.After(d time.Duration) <-chan Time`**

*   `time.After` は、引数で指定された期間 `d` が経過した**後**に、**現在時刻 (`time.Time`)** を一度だけ送信する**受信専用チャネル** (`<-chan Time`) を返します。
*   この返されたチャネルを `select` 文の `case` で使うことで、タイムアウト機構を実現できます。

**パターン:**
```go
select {
case result := <-operationChan:
	// 操作がタイムアウト前に完了した場合の処理
	fmt.Println("操作完了:", result)
case <-time.After(timeoutDuration):
	// timeoutDuration が経過しても operationChan から受信できなかった場合の処理
	fmt.Println("タイムアウトしました！")
}
```

*   `select` は `operationChan` からの受信と `time.After` が返すチャネルからの受信を同時に待ちます。
*   もし `timeoutDuration` が経過する前に `operationChan` から受信できれば、最初の `case` が実行されます。
*   もし `operationChan` から受信する前に `timeoutDuration` が経過すると、`time.After` が返すチャネルから現在時刻が受信可能になり、2番目の `case` (タイムアウト処理) が実行されます。

## コード例

```go title="select と time.After によるタイムアウト"
package main

import (
	"fmt"
	"time"
)

// 時間のかかる処理をシミュレートする関数
// 指定された時間後に結果をチャネルに送信する
func longOperation(duration time.Duration, resultChan chan<- string) {
	fmt.Printf("  (Goroutine: %v の処理を開始...)\n", duration)
	time.Sleep(duration) // 時間のかかる処理を模倣
	result := fmt.Sprintf("処理完了 (%v)", duration)
	fmt.Printf("  (Goroutine: 結果 '%s' を送信)\n", result)
	resultChan <- result
}

func main() {
	// --- ケース1: タイムアウトするケース ---
	fmt.Println("--- ケース1: タイムアウト (1秒待つが処理は2秒かかる) ---")
	ch1 := make(chan string, 1) // 結果受信用チャネル (バッファ1)
	go longOperation(2*time.Second, ch1) // 2秒かかる処理を Goroutine で開始

	select {
	case res := <-ch1: // ch1 から受信を試みる
		fmt.Printf("受信成功: %s\n", res)
	case <-time.After(1 * time.Second): // ★ 1秒間のタイムアウトを設定
		// 1秒経過しても ch1 から受信できなかった場合、こちらが実行される
		fmt.Println("タイムアウトしました！ (1秒)")
	}

	// --- ケース2: タイムアウトしないケース ---
	fmt.Println("\n--- ケース2: 間に合う (2秒待つ、処理は1秒で終わる) ---")
	ch2 := make(chan string, 1)
	go longOperation(1*time.Second, ch2) // 1秒で終わる処理

	select {
	case res := <-ch2: // ch2 から受信を試みる
		// 処理が1秒で終わるので、タイムアウト前にこちらが実行される
		fmt.Printf("受信成功: %s\n", res)
	case <-time.After(2 * time.Second): // ★ 2秒間のタイムアウトを設定
		fmt.Println("タイムアウトしました！ (2秒)")
	}

	// 注意: Goroutine がタイムアウト後も動き続ける可能性がある
	// 上記の例では、ケース1でタイムアウトしても、longOperation の Goroutine は
	// 2秒後に ch1 に送信しようとする（ただし受信側がいないのでブロックする可能性がある）。
	// 実際のアプリケーションでは、Context を使って Goroutine にキャンセルを伝えるなどの
	// 追加処理が必要になることが多い (後のセクションで説明)。
	fmt.Println("\n(main 終了前に少し待機して Goroutine の完了を確認)")
	time.Sleep(2 * time.Second) // デモ用に待機
}

/* 実行結果の例:
--- ケース1: タイムアウト (1秒待つが処理は2秒かかる) ---
  (Goroutine: 2s の処理を開始...)
タイムアウトしました！ (1秒)

--- ケース2: 間に合う (2秒待つ、処理は1秒で終わる) ---
  (Goroutine: 1s の処理を開始...)
  (Goroutine: 結果 '処理完了 (1s)' を送信)
受信成功: 処理完了 (1s)

(main 終了前に少し待機して Goroutine の完了を確認)
  (Goroutine: 結果 '処理完了 (2s)' を送信) <- ケース1の Goroutine がここで送信しようとする
*/
```

**コード解説:**

*   **ケース1:** `longOperation` は2秒かかりますが、`select` のタイムアウトは `time.After(1 * time.Second)` で1秒に設定されています。そのため、`ch1` から受信する前に1秒が経過し、タイムアウトの `case` が実行されます。
*   **ケース2:** `longOperation` は1秒で完了します。`select` のタイムアウトは2秒です。処理がタイムアウト前に完了し、`ch2` に結果が送信されるため、`case res := <-ch2:` が実行されます。
*   **注意点:** `time.After` を使ったタイムアウトは、`select` 文が待つのをやめるだけであり、バックグラウンドで実行されている Goroutine (`longOperation`) を**自動的に停止させるわけではありません**。タイムアウトした場合でも、Goroutine は処理を続け、完了後にチャネルに送信しようとする可能性があります（受信側がいなければブロックします）。Goroutine 自体をキャンセルするには、`context` パッケージを使うのが一般的です。

`select` と `time.After` の組み合わせは、外部API呼び出しや時間のかかる可能性のある操作に対して、応答がない場合に処理を打ち切るための簡単で一般的な方法です。