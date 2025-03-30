## タイトル
title: `select` によるタイムアウト処理

## タグ
tags: ["concurrency", "channel", "goroutine", "select", "timeout", "time.After", "同期"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// 時間のかかる処理 (シミュレーション)
func longOperation(duration time.Duration, resultChan chan<- string) {
	fmt.Printf(" Goroutine: %v 処理開始...\n", duration)
	time.Sleep(duration)
	result := fmt.Sprintf("完了 (%v)", duration)
	fmt.Printf(" Goroutine: 結果 '%s' 送信\n", result)
	// 注意: タイムアウト後も送信しようとする可能性がある
	resultChan <- result
}

func main() {
	ch1 := make(chan string, 1)
	go longOperation(2*time.Second, ch1) // 2秒かかる処理

	fmt.Println("1秒間のタイムアウトを設定して待機...")

	select {
	case res := <-ch1: // 処理結果の受信を待つ
		fmt.Printf("受信成功: %s\n", res)
	case <-time.After(1 * time.Second): // 1秒待つ
		// 1秒以内に ch1 から受信できなければ、こちらが実行される
		fmt.Println("タイムアウトしました！")
	}

	// (タイムアウトしなかった場合の例は解説参照)
	// time.Sleep(2 * time.Second) // Goroutine が完了するのを待つ (デモ用)
}

```

## 解説
```text
チャネル操作は相手の準備ができるまでブロックする可能性がありますが、
無期限に待たずに一定時間で中断（タイムアウト）したい場合があります。
`select` 文と `time.After` で実現できます。

**`time.After` によるタイムアウト:**
`time.After(d time.Duration)` は、指定期間 `d` 経過後に
現在時刻を一度だけ送信する**受信専用チャネル** (`<-chan Time`) を返します。

**`select` での利用パターン:**
```go
select {
case result := <-operationChan:
    // 操作がタイムアウト前に完了
case <-time.After(timeoutDuration):
    // タイムアウト発生
}
```
*   `select` は `operationChan` と `time.After` のチャネルを同時に待つ。
*   `timeoutDuration` 前に `operationChan` から受信できれば最初の `case`。
*   `timeoutDuration` が経過すると `time.After` のチャネルが受信可能になり、
    タイムアウトの `case` が実行される。

コード例では、2秒かかる `longOperation` を起動し、`select` で
結果チャネル `ch1` と1秒のタイムアウト (`time.After`) を待ちます。
1秒経過しても `ch1` から受信できないため、タイムアウトの `case` が実行されます。

もし `longOperation` が1秒、タイムアウトが2秒なら、
タイムアウト前に `ch1` から受信でき、最初の `case` が実行されます。

**注意点:**
`time.After` によるタイムアウトは `select` 文の待機を中断するだけで、
バックグラウンドの Goroutine (`longOperation`) を**自動停止させません**。
Goroutine 自体のキャンセルには `context` パッケージを使うのが一般的です。

`select` と `time.After` は、外部API呼び出し等で応答がない場合に
処理を打ち切るための簡単で一般的な方法です。