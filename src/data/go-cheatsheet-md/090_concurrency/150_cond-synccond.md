---
title: "並行処理: 条件変数 (`sync.Cond`)"
tags: ["concurrency", "goroutine", "sync", "Cond", "Mutex", "条件変数", "待機", "通知", "Wait", "Signal", "Broadcast"]
---

`sync.Mutex` や `sync.RWMutex` は共有リソースへのアクセスを排他的に制御しますが、ある Goroutine が**特定の条件が満たされるまで待機**し、別の Goroutine がその**条件が満たされたことを通知**する、といったより複雑な同期を行いたい場合があります。このような場合に利用できるのが **`sync.Cond` (条件変数)** です。

## `sync.Cond` とは？

*   `Cond` は、特定の条件に関連付けられた Goroutine の待機場所を提供します。
*   `Cond` は必ず **`sync.Locker`** インターフェース（通常は `*sync.Mutex`）と組み合わせて使われます。この `Locker` は、条件のチェックや変更、そして `Cond` のメソッド呼び出しを保護するために必要です。
*   **生成:** `sync.NewCond(locker sync.Locker)` で生成します。`locker` には通常、`&sync.Mutex{}` を渡します。
*   **主なメソッド:**
    *   **`Wait()`**:
        1.  呼び出し元の Goroutine を待機状態にします。
        2.  `Cond` に関連付けられた `Locker` を**自動的にアンロック**します（これにより、他の Goroutine が条件を変更できるようになります）。
        3.  `Signal()` または `Broadcast()` によって**起こされる**まで待機します。
        4.  起こされた後、`Locker` を**再度自動的にロック**してから `Wait()` から戻ります。
        *   **重要:** `Wait()` は**必ず `Locker` がロックされた状態で呼び出す**必要があります。また、`Wait()` から戻った後は、**再度条件をチェックする**必要があります（偽の起床 (spurious wakeup) や、他の Goroutine によって条件が再び偽になった可能性があるため）。通常は `for 条件 { cond.Wait() }` のようにループ内で使います。
    *   **`Signal()`**: `Cond` で待機している Goroutine のうち、**一つ**を起こします。どの Goroutine が起こされるかは保証されません。待機している Goroutine がなければ何も起こりません。
        *   **重要:** `Signal()` は**通常 `Locker` がロックされた状態で呼び出します**（条件を変更した直後など）。
    *   **`Broadcast()`**: `Cond` で待機している**すべて**の Goroutine を起こします。待機している Goroutine がなければ何も起こりません。
        *   **重要:** `Broadcast()` も**通常 `Locker` がロックされた状態で呼び出します**。

## `sync.Cond` の使い方 (生産者/消費者モデル)

よくある例として、ある Goroutine（生産者）がデータを準備し、別の Goroutine（消費者）がデータが準備できるのを待つ、というシナリオがあります。

1.  共有データと、それを保護するための `sync.Mutex`、そして `sync.Cond` を用意します。`Cond` には Mutex のポインタを渡します。
2.  **消費者 Goroutine:**
    *   Mutex をロックします (`cond.L.Lock()`)。
    *   **`for 条件が満たされていない { cond.Wait() }`** のループで待機します。`Wait()` は内部で一時的にアンロックし、起こされたら再度ロックします。
    *   条件が満たされたら（ループを抜けたら）、共有データを使って処理を行います。
    *   最後に Mutex をアンロックします (`cond.L.Unlock()`)。
3.  **生産者 Goroutine:**
    *   Mutex をロックします (`cond.L.Lock()`)。
    *   共有データを変更し、**条件を満たす状態**にします。
    *   **`cond.Signal()`** または **`cond.Broadcast()`** を呼び出して、待機している Goroutine を起こします。
    *   Mutex をアンロックします (`cond.L.Unlock()`)。

## コード例: データ準備の待機

```go title="sync.Cond を使ったデータ準備の待機"
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	data      string        // 共有データ (最初は空)
	dataMutex sync.Mutex    // data を保護する Mutex
	dataCond  = sync.NewCond(&dataMutex) // Mutex に関連付けられた Cond
	wg        sync.WaitGroup
)

// 消費者 Goroutine: データが準備されるのを待つ
func consumer() {
	defer wg.Done()
	fmt.Println("Consumer: 開始、データ待機中...")

	// 1. ロックを取得
	dataCond.L.Lock() // dataMutex.Lock() と同じ

	// 2. 条件 (data != "") が満たされるまでループ内で Wait()
	for data == "" { // ★ 条件をチェック
		fmt.Println("Consumer: データがないため Wait() します...")
		// Wait() は mutex をアンロックし、Signal/Broadcast を待つ。
		// 起こされたら mutex を再ロックして戻る。
		dataCond.Wait()
		fmt.Println("Consumer: Wait() から起こされました。再度条件をチェックします...")
	}

	// 3. 条件が満たされたので、共有データにアクセス
	fmt.Printf("Consumer: データ '%s' を受け取りました！\n", data)

	// 4. ロックを解放
	dataCond.L.Unlock() // dataMutex.Unlock() と同じ
	fmt.Println("Consumer: 終了")
}

// 生産者 Goroutine: データを準備して通知する
func producer() {
	defer wg.Done()
	fmt.Println("Producer: 開始、データ準備中...")
	time.Sleep(1 * time.Second) // データ準備に時間がかかると仮定

	// 1. ロックを取得
	dataCond.L.Lock()

	// 2. 共有データを変更 (条件を満たす)
	data = "これが準備されたデータです"
	fmt.Println("Producer: データを準備しました。")

	// 3. 待機している Goroutine (Consumer) を起こす
	fmt.Println("Producer: Signal() を呼び出して Consumer を起こします。")
	dataCond.Signal() // 待機中の Goroutine が一つだけなので Signal で十分
	// dataCond.Broadcast() // 複数の待機者を起こす場合

	// 4. ロックを解放
	dataCond.L.Unlock()
	fmt.Println("Producer: 終了")
}

func main() {
	wg.Add(2) // 2つの Goroutine を待つ

	go consumer() // 消費者を起動
	// 少し待ってから生産者を起動 (消費者が先に Wait() するように)
	time.Sleep(100 * time.Millisecond)
	go producer() // 生産者を起動

	wg.Wait() // 両方の Goroutine が終了するのを待つ
	fmt.Println("main: すべて完了")
}

/* 実行結果の例:
Consumer: 開始、データ待機中...
Consumer: データがないため Wait() します...
Producer: 開始、データ準備中...
Producer: データを準備しました。
Producer: Signal() を呼び出して Consumer を起こします。
Producer: 終了
Consumer: Wait() から起こされました。再度条件をチェックします...
Consumer: データ '%s' を受け取りました！
Consumer: 終了
main: すべて完了
*/
```

**コード解説:**

*   `dataCond = sync.NewCond(&dataMutex)`: `dataMutex` に関連付けられた条件変数 `dataCond` を作成します。
*   **`consumer`:**
    *   `dataCond.L.Lock()`: Mutex をロックします (`dataCond.L` は内部の `Locker`、つまり `&dataMutex` を返します)。
    *   `for data == "" { dataCond.Wait() }`: `data` が空である間、`Wait()` を呼び出し続けます。`Wait()` は `dataMutex` を一時的にアンロックし、`Signal` または `Broadcast` を待ちます。起こされると `dataMutex` を再ロックし、ループの条件 `data == ""` を再評価します。
    *   ループを抜けたら（`data` が空でなくなったら）、データを使用します。
    *   `dataCond.L.Unlock()`: Mutex をアンロックします。
*   **`producer`:**
    *   `dataCond.L.Lock()`: Mutex をロックします。
    *   `data = "..."`: 共有データを変更します。
    *   `dataCond.Signal()`: `Wait()` で待機している `consumer` を起こします。
    *   `dataCond.L.Unlock()`: Mutex をアンロックします。

`sync.Cond` は、チャネルだけでは表現しにくい、より複雑な Goroutine 間の待機・通知のシナリオで役立ちます。ただし、Mutex のロック/アンロックと `Wait` の呼び出し順序、ループによる条件再チェックなど、正しく使うためには注意が必要です。