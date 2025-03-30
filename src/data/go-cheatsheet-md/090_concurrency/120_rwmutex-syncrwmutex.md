## タイトル
title: 読み取り/書き込みロック (`sync.RWMutex`)

## タグ
tags: ["concurrency", "goroutine", "sync", "RWMutex", "Mutex", "読み取りロック", "書き込みロック", "競合状態", "パフォーマンス"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var config = make(map[string]string)
var rwmu sync.RWMutex // 読み取り/書き込みロック

// 読み取り (RLock/RUnlock)
func getConfig(key string, wg *sync.WaitGroup) {
	defer wg.Done()
	rwmu.RLock() // 読み取りロック獲得
	defer rwmu.RUnlock() // 必ず解放

	value := config[key]
	fmt.Printf("Reader: Read '%s' -> '%s'\n", key, value)
	time.Sleep(50 * time.Millisecond)
}

// 書き込み (Lock/Unlock)
func setConfig(key, value string, wg *sync.WaitGroup) {
	defer wg.Done()
	rwmu.Lock() // 書き込みロック獲得 (排他的)
	defer rwmu.Unlock() // 必ず解放

	fmt.Printf("Writer: Set '%s' = '%s'\n", key, value)
	config[key] = value
	time.Sleep(100 * time.Millisecond)
}

func main() {
	var wg sync.WaitGroup

	// 初期設定 (書き込み)
	wg.Add(1); go setConfig("key1", "val1", &wg); wg.Wait()

	// 複数リーダーと1ライター起動
	for i := 0; i < 3; i++ { wg.Add(1); go getConfig("key1", &wg) }
	time.Sleep(10 * time.Millisecond)
	wg.Add(1); go setConfig("key1", "val2", &wg)
	for i := 0; i < 2; i++ { wg.Add(1); go getConfig("key1", &wg) }

	wg.Wait() // 全て完了を待つ
	fmt.Println("Final key1:", config["key1"]) // val2
}
```

## 解説
```text
`sync.Mutex` は読み書きを区別せず常に排他制御しますが、
**読み取りが圧倒的に多く、書き込みが少ない**場合、
読み取り同士もブロックされ非効率になることがあります。

このような状況に適しているのが **`sync.RWMutex`**
(読み取り/書き込みロック) です。`import "sync"` で利用します。

**ロックの種類:**
*   **読み取りロック (Read Lock):**
    *   `RLock()` で獲得、`RUnlock()` で解放。
    *   **複数 Goroutine が同時に獲得可能**。
    *   ただし、書き込みロック中は獲得不可 (ブロック)。
*   **書き込みロック (Write Lock):**
    *   `Lock()` で獲得、`Unlock()` で解放 (`Mutex` と同じ)。
    *   **排他的**: これを獲得中は他の誰も
        読み取りロックも書き込みロックも獲得不可 (ブロック)。
    *   読み取りロック獲得中も書き込みロックは獲得不可 (ブロック)。

**使い分け:**
*   共有リソースを**変更しない** (読み取るだけ) -> **読み取りロック** (`RLock`/`RUnlock`)。
*   共有リソースを**変更する** (書き込む) -> **書き込みロック** (`Lock`/`Unlock`)。

**使い方:**
1. `var rwmu sync.RWMutex` を宣言。
2. 読み取り時: `rwmu.RLock()`, `defer rwmu.RUnlock()`。
3. 書き込み時: `rwmu.Lock()`, `defer rwmu.Unlock()`。
   **`defer` での解放忘れはデッドロックの原因！**

コード例では `getConfig` で読み取りロック、`setConfig` で
書き込みロックを使っています。複数の `getConfig` は並行に
実行され得ますが、`setConfig` は他の読み書きをブロックします。

**`RWMutex` を使うべき場面:**
読み取り操作が中心で、書き込みが少ない場合に
`Mutex` より高いパフォーマンス（読み取り並行性）が期待できます。
書き込みが多い場合や区別が複雑な場合は `Mutex` の方が
シンプルな場合があります。アクセスパターンを考慮して選択します。