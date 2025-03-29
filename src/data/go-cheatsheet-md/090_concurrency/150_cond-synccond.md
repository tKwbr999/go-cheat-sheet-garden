## タイトル
title: 条件変数 (`sync.Cond`)

## タグ
tags: ["concurrency", "goroutine", "sync", "Cond", "Mutex", "条件変数", "待機", "通知", "Wait", "Signal", "Broadcast"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	data      string
	dataMutex sync.Mutex
	dataCond  = sync.NewCond(&dataMutex) // Mutex に関連付け
	wg        sync.WaitGroup
)

// 消費者: データが準備されるのを待つ
func consumer() {
	defer wg.Done()
	fmt.Println("Consumer: 待機開始")
	dataCond.L.Lock() // ロック取得
	for data == "" { // ★ 条件チェックループ
		fmt.Println("Consumer: Wait...")
		dataCond.Wait() // アンロックして待機、起こされたら再ロック
	}
	fmt.Printf("Consumer: データ受信 '%s'\n", data)
	dataCond.L.Unlock() // ロック解放
}

// 生産者: データを準備して通知
func producer() {
	defer wg.Done()
	fmt.Println("Producer: 準備開始")
	time.Sleep(100 * time.Millisecond) // 準備時間
	dataCond.L.Lock() // ロック取得
	data = "準備完了データ"
	fmt.Println("Producer: 準備完了、Signal 送信")
	dataCond.Signal() // 待機中の Goroutine を1つ起こす
	dataCond.L.Unlock() // ロック解放
}

func main() {
	wg.Add(2)
	go consumer()
	time.Sleep(10 * time.Millisecond) // consumer が先に Wait するように
	go producer()
	wg.Wait()
	fmt.Println("完了")
}

```

## 解説
```text
**`sync.Cond` (条件変数)** は、ある Goroutine が
**特定の条件が満たされるまで待機**し、別の Goroutine が
その**条件が満たされたことを通知**する、より複雑な同期に使います。
`import "sync"` で利用します。

**`sync.Cond` とは？**
*   条件に関連付けられた Goroutine の待機場所。
*   必ず **`sync.Locker`** (通常 `*sync.Mutex`) と組み合わせて使う。
    条件のチェック/変更や `Cond` メソッド呼び出しを保護するため。
*   **生成:** `sync.NewCond(locker)` (例: `sync.NewCond(&mu)`)。

**主なメソッド:**
*   **`Wait()`**:
    1. 待機状態になる。
    2. 関連する Locker を**自動アンロック**。
    3. `Signal`/`Broadcast` で起こされるまで待つ。
    4. 起こされたら Locker を**再ロック**して戻る。
    *   **重要:** 必ず Locker を**ロックした状態**で呼び出す。
        `Wait()` から戻ったら**再度条件をチェック**する必要がある
        (偽の起床等のため)。通常 `for 条件 { cond.Wait() }` ループで使う。
*   **`Signal()`**: 待機中の Goroutine を**一つ**起こす。
    (通常、Locker をロックした状態で呼ぶ)
*   **`Broadcast()`**: 待機中の**すべて**の Goroutine を起こす。
    (通常、Locker をロックした状態で呼ぶ)

**使い方 (生産者/消費者):**
1. 共有データ、Mutex、Cond を用意 (`sync.NewCond(&mutex)`)。
2. **消費者:** Lock -> `for 条件 { Wait() }` -> データ処理 -> Unlock。
3. **生産者:** Lock -> データ変更 (条件充足) -> `Signal`/`Broadcast` -> Unlock。

コード例では、`consumer` が `data == ""` の間 `dataCond.Wait()` し、
`producer` が `data` を設定後に `dataCond.Signal()` で `consumer` を
起こしています。Mutex (`dataCond.L`) によりデータアクセスと条件チェックが
保護されています。

`sync.Cond` はチャネルだけでは難しい複雑な同期に役立ちますが、
ロック/アンロックや条件再チェックなど、正しい使用に注意が必要です。