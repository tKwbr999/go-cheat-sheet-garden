---
title: "並行処理: 読み取り/書き込みロック (`sync.RWMutex`)"
tags: ["concurrency", "goroutine", "sync", "RWMutex", "Mutex", "読み取りロック", "書き込みロック", "競合状態", "パフォーマンス"]
---

`sync.Mutex` は共有リソースへのアクセスを一度に一つの Goroutine に限定しますが、リソースへのアクセスが**読み取り**操作なのか**書き込み**操作なのかを区別しません。もし、**読み取り操作が圧倒的に多く、書き込み操作が少ない**場合、読み取り操作同士は同時に行われても問題ないはずなのに、`Mutex` を使うと読み取り操作も排他制御されてしまい、パフォーマンスが低下する可能性があります。

このような状況に適しているのが **`sync.RWMutex` (読み取り/書き込みロック)** です。

## `sync.RWMutex` とは？

`RWMutex` は、読み取り操作と書き込み操作に対して異なる種類のロックを提供します。

*   **読み取りロック (Read Lock):**
    *   `RLock()` で獲得し、`RUnlock()` で解放します。
    *   **複数の Goroutine が同時に読み取りロックを獲得できます**。
    *   ただし、**いずれかの Goroutine が書き込みロックを獲得している間は、他の Goroutine は読み取りロックを獲得できずブロック**されます。
*   **書き込みロック (Write Lock):**
    *   `Lock()` で獲得し、`Unlock()` で解放します（`sync.Mutex` と同じメソッド名）。
    *   書き込みロックは**排他的**です。一つの Goroutine が書き込みロックを獲得している間は、他の Goroutine は**読み取りロックも書き込みロックも獲得できずブロック**されます。
    *   また、いずれかの Goroutine が読み取りロックを獲得している間も、他の Goroutine は書き込みロックを獲得できずブロックされます。

**使い分け:**

*   共有リソースを**変更しない**（読み取るだけの）場合は、**読み取りロック (`RLock`/`RUnlock`)** を使います。
*   共有リソースを**変更する**（書き込む）場合は、**書き込みロック (`Lock`/`Unlock`)** を使います。

## `sync.RWMutex` の使い方

1.  保護したい共有リソースと一緒に `sync.RWMutex` 型の変数を宣言します (`var rwmu sync.RWMutex`)。
2.  **読み取り**アクセスの場合:
    *   `rwmu.RLock()` で読み取りロックを獲得します。
    *   **`defer rwmu.RUnlock()`** で確実に解放します。
    *   `RLock()` と `RUnlock()` の間で読み取り操作を行います。
3.  **書き込み**アクセスの場合:
    *   `rwmu.Lock()` で書き込みロックを獲得します。
    *   **`defer rwmu.Unlock()`** で確実に解放します。
    *   `Lock()` と `Unlock()` の間で書き込み操作を行います。

## コード例: 設定値の読み書き

複数の Goroutine が設定値を読み取り、時々書き込みを行う例を考えます。

```go title="RWMutex による設定値の保護"
package main

import (
	"fmt"
	"sync"
	"time"
)

var config = make(map[string]string) // 共有される設定値 (マップ)
var rwmu sync.RWMutex                // config を保護するための RWMutex

// 設定値を読み取る関数 (読み取りロックを使用)
func getConfig(key string, wg *sync.WaitGroup) {
	defer wg.Done()

	// 読み取りロックを獲得
	rwmu.RLock()
	// ★ defer で読み取りロックを解放
	defer rwmu.RUnlock()

	// 読み取り操作
	value, ok := config[key]
	fmt.Printf("Reader: キー '%s' を読み取り -> 値: '%s' (存在: %t)\n", key, value, ok)
	time.Sleep(50 * time.Millisecond) // 読み取りにも少し時間がかかると仮定
}

// 設定値を書き込む関数 (書き込みロックを使用)
func setConfig(key, value string, wg *sync.WaitGroup) {
	defer wg.Done()

	// 書き込みロックを獲得 (他のリーダーもライターもブロックされる)
	rwmu.Lock()
	// ★ defer で書き込みロックを解放
	defer rwmu.Unlock()

	fmt.Printf("Writer: キー '%s' に値 '%s' を書き込み中...\n", key, value)
	// 書き込み操作
	config[key] = value
	time.Sleep(100 * time.Millisecond) // 書き込みにはより時間がかかると仮定
	fmt.Printf("Writer: キー '%s' の書き込み完了\n", key)
}

func main() {
	var wg sync.WaitGroup

	// 初期設定 (書き込み)
	wg.Add(1)
	go setConfig("apiKey", "initial-key", &wg)
	wg.Wait() // 初期設定が終わるのを待つ

	fmt.Println("\n--- 複数のリーダーと1つのライターを実行 ---")

	// 複数のリーダーを起動
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go getConfig("apiKey", &wg) // 複数のリーダーが同時に実行される
	}

	// 少し遅れてライターを起動
	time.Sleep(10 * time.Millisecond)
	wg.Add(1)
	go setConfig("apiKey", "updated-key-123", &wg) // ライターはリーダーや他のライターをブロックする

	// さらにリーダーを起動
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go getConfig("apiKey", &wg)
	}

	// すべての Goroutine の完了を待つ
	wg.Wait()

	fmt.Println("\n--- 最終的な設定値 ---")
	// 最後に読み取りロックで確認
	rwmu.RLock()
	fmt.Printf("apiKey: %s\n", config["apiKey"])
	rwmu.RUnlock()
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
Writer: キー 'apiKey' に値 'initial-key' を書き込み中...
Writer: キー 'apiKey' の書き込み完了

--- 複数のリーダーと1つのライターを実行 ---
Reader: キー 'apiKey' を読み取り -> 値: 'initial-key' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'initial-key' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'initial-key' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'initial-key' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'initial-key' (存在: true)
Writer: キー 'apiKey' に値 'updated-key-123' を書き込み中...
Writer: キー 'apiKey' の書き込み完了
Reader: キー 'apiKey' を読み取り -> 値: 'updated-key-123' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'updated-key-123' (存在: true)
Reader: キー 'apiKey' を読み取り -> 値: 'updated-key-123' (存在: true)

--- 最終的な設定値 ---
apiKey: updated-key-123
*/
```

**コード解説:**

*   `getConfig` 関数は設定値を読み取るだけなので、`rwmu.RLock()` と `defer rwmu.RUnlock()` を使います。複数の `getConfig` Goroutine は同時にロックを獲得し、並行して読み取りを実行できます。
*   `setConfig` 関数は設定値を変更（書き込み）するため、`rwmu.Lock()` と `defer rwmu.Unlock()` を使います。`setConfig` がロックを獲得している間は、他の `getConfig` や `setConfig` はブロックされます。
*   `main` 関数では、最初に初期設定を行い、その後複数のリーダーと1つのライターを起動しています。実行結果を見ると、最初のリーダーたちは `initial-key` を読み取りますが、ライターが実行された後のリーダーたちは `updated-key-123` を読み取っていることがわかります。また、リーダーの実行中にライターが割り込むことはなく、ライターの実行中にリーダーが割り込むこともありません。

**`RWMutex` を使うべき場面:**

`sync.RWMutex` は、共有リソースへのアクセスが**読み取り操作が中心で、書き込み操作は比較的少ない**場合に、`sync.Mutex` よりも高いパフォーマンス（特に読み取りの並行性）を発揮する可能性があります。

一方で、書き込み操作が頻繁に発生する場合や、読み取りと書き込みの区別が複雑な場合は、単純な `sync.Mutex` を使う方がコードがシンプルになり、管理しやすいこともあります。どちらを使うかは、アクセスパターンとパフォーマンス要件を考慮して選択します。