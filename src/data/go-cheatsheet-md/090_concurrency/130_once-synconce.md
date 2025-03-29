## タイトル
title: 一度だけの実行 (`sync.Once`)

## タグ
tags: ["concurrency", "goroutine", "sync", "Once", "初期化", "シングルトン", "Do"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var config map[string]string
var loadConfigOnce sync.Once // ★ sync.Once 変数

// 設定読み込み関数 (一度だけ実行される)
func loadConfig() {
	fmt.Println("--- 設定読み込み実行 ---")
	time.Sleep(100 * time.Millisecond) // 時間がかかる処理を模倣
	config = map[string]string{"apiKey": "xyz"}
	fmt.Println("--- 設定読み込み完了 ---")
}

// 設定取得関数 (必要なら初期化)
func getConfig(key string, wg *sync.WaitGroup) {
	defer wg.Done()
	// ★ Do メソッドで loadConfig を呼び出す
	//   最初の呼び出し時のみ loadConfig が実行される
	loadConfigOnce.Do(loadConfig)

	// Do の後では config は初期化済み
	value := config[key]
	fmt.Printf("Goroutine: Get '%s' -> '%s'\n", key, value)
}

func main() {
	var wg sync.WaitGroup
	numGoroutines := 3
	wg.Add(numGoroutines)
	for i := 0; i < numGoroutines; i++ {
		go getConfig("apiKey", &wg) // 複数 Goroutine から呼び出し
	}
	wg.Wait()
	fmt.Println("初回取得完了")

	// 再度呼び出しても loadConfig は実行されない
	wg.Add(1); go getConfig("apiKey", &wg); wg.Wait()
}

```

## 解説
```text
プログラム全体で**一度だけ**実行したい初期化処理
(設定読み込み、シングルトン生成等) を安全に行うには
**`sync.Once`** を使います。`import "sync"` で利用します。

**`sync.Once` とは？**
*   `Do(f func())` というメソッドを持つ構造体。
*   `Do` メソッドは、**最初に呼び出されたときだけ**、
    引数の関数 `f` (引数なし) を実行する。
*   2回目以降の `Do` 呼び出しでは `f` は実行されない。
*   複数の Goroutine から同時に `Do` が呼ばれても、
    `f` が厳密に一度だけ実行されることを保証する (内部ロック)。

**使い方:**
1. `var once sync.Once` のように変数を宣言 (通常パッケージレベル)。
2. 一度だけ実行したい処理を引数なし関数 `f` として用意。
3. 実行したい場所で `once.Do(f)` を呼び出す。

コード例では、`loadConfigOnce sync.Once` を宣言し、
`getConfig` 関数内で `loadConfigOnce.Do(loadConfig)` を
呼び出しています。
複数の Goroutine が `getConfig` を呼び出しても、
`loadConfig` 関数（設定読み込み処理）は
「設定読み込み実行」のログが示すように、
プログラム全体を通して厳密に一度だけ実行されます。
2回目以降の `getConfig` 呼び出しでは `Do` は何もせず、
既に初期化済みの `config` を使います。

`sync.Once` は、共有リソース等の初期化処理を
競合なく安全かつ効率的に一度だけ実行したい場合に
非常に便利なツールです。