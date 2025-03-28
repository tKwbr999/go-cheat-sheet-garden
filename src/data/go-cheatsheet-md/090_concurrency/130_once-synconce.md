---
title: "並行処理: 一度だけの実行 (`sync.Once`)"
tags: ["concurrency", "goroutine", "sync", "Once", "初期化", "シングルトン", "Do"]
---

プログラム全体で**一度だけ**実行したい初期化処理（例えば、設定の読み込み、シングルトンオブジェクトの生成、リソースの準備など）がある場合、複数の Goroutine が同時にその初期化処理を実行しようとすると問題が発生する可能性があります。

このような「一度だけ実行」を安全かつ確実に保証するための仕組みが **`sync.Once`** です。

## `sync.Once` とは？

*   `sync.Once` は、`Do` という一つのメソッドを持つ構造体です。
*   **`Do(f func())`**: このメソッドは、引数として**引数を取らない関数 `f`** を受け取ります。`Do` メソッドが**最初に呼び出されたときだけ**、引数で渡された関数 `f` を実行します。2回目以降に同じ `sync.Once` 変数に対して `Do` が呼び出されても、関数 `f` は**実行されません**。
*   この動作は、複数の Goroutine から同時に `Do` が呼び出された場合でも保証されます。内部的にロック機構を使って、関数 `f` が厳密に一度だけ実行されることを保証します。

## `sync.Once` の使い方

1.  `sync.Once` 型の変数を宣言します (`var once sync.Once`)。通常、一度だけ実行したい処理に関連するスコープ（パッケージレベルなど）で宣言します。
2.  一度だけ実行したい処理を、**引数を取らない関数**として定義します（または関数リテラルを使います）。
3.  その処理を実行したい場所で `once.Do(関数)` を呼び出します。

## コード例: 設定の遅延初期化

設定ファイルを一度だけ読み込む例を見てみましょう。複数の Goroutine が設定を取得しようとしても、ファイルの読み込みは最初の1回だけ行われます。

```go title="sync.Once による一度だけの初期化"
package main

import (
	"fmt"
	"sync"
	"time"
)

var config map[string]string // 共有される設定 (遅延初期化される)
var loadConfigOnce sync.Once  // 設定読み込みを一度だけ行うための sync.Once

// 設定を読み込む関数 (一度だけ実行される)
func loadConfig() {
	fmt.Println("--- 設定ファイルを読み込み中... (このメッセージは1回だけ表示されるはず) ---")
	// 実際にはファイル読み込みなどの処理
	time.Sleep(100 * time.Millisecond) // 読み込みに時間がかかると仮定
	config = map[string]string{
		"apiKey":    "xyz789",
		"apiSecret": "supersecret",
		"endpoint":  "https://api.example.com",
	}
	fmt.Println("--- 設定の読み込み完了 ---")
}

// 設定値を取得する関数 (必要なら初期化を行う)
func getConfig(key string, wg *sync.WaitGroup) {
	defer wg.Done()

	// ★ loadConfigOnce.Do を呼び出す ★
	// loadConfig 関数がまだ一度も実行されていなければ実行する。
	// 既に実行済みであれば、何もせずに通過する。
	loadConfigOnce.Do(loadConfig)

	// Do の呼び出しが終わった時点で、config は初期化されていることが保証される
	// (もし loadConfig が panic した場合は別)
	value := config[key]
	fmt.Printf("Goroutine: キー '%s' の設定値を取得: '%s'\n", key, value)
}

func main() {
	var wg sync.WaitGroup
	numGoroutines := 5

	fmt.Printf("%d 個の Goroutine が同時に設定を取得しようとします...\n", numGoroutines)

	wg.Add(numGoroutines)
	for i := 0; i < numGoroutines; i++ {
		// 複数の Goroutine から getConfig を呼び出す
		go getConfig("apiKey", &wg)
	}

	// すべての Goroutine の完了を待つ
	wg.Wait()

	fmt.Println("\n再度設定を取得してみます...")
	// 再度 getConfig を呼び出しても、loadConfig は実行されないはず
	wg.Add(1)
	go getConfig("endpoint", &wg)
	wg.Wait()

	fmt.Println("\nすべての処理が完了しました。")
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
5 個の Goroutine が同時に設定を取得しようとします...
--- 設定ファイルを読み込み中... (このメッセージは1回だけ表示されるはず) ---
--- 設定の読み込み完了 ---
Goroutine: キー 'apiKey' の設定値を取得: 'xyz789'
Goroutine: キー 'apiKey' の設定値を取得: 'xyz789'
Goroutine: キー 'apiKey' の設定値を取得: 'xyz789'
Goroutine: キー 'apiKey' の設定値を取得: 'xyz789'
Goroutine: キー 'apiKey' の設定値を取得: 'xyz789'

再度設定を取得してみます...
Goroutine: キー 'endpoint' の設定値を取得: 'https://api.example.com'

すべての処理が完了しました。
*/
```

**コード解説:**

*   `loadConfigOnce sync.Once`: `loadConfig` 関数の実行を制御するための `sync.Once` 変数です。
*   `loadConfig()`: 実際に初期化処理を行う関数です。引数を取らないように定義します。
*   `getConfig()` 内の `loadConfigOnce.Do(loadConfig)`:
    *   `getConfig` が最初に呼び出された Goroutine では、`loadConfig` 関数が実行されます（「設定ファイルを読み込み中...」が表示されます）。
    *   他の Goroutine がほぼ同時に `getConfig` を呼び出しても、`Do` メソッドの内部的なロックにより、`loadConfig` が完了するまで待機し、自身では `loadConfig` を再実行しません。
    *   `loadConfig` が完了した後、待機していた Goroutine は `Do` から戻り、初期化済みの `config` にアクセスします。
    *   2回目以降に `getConfig` が呼び出された場合（`main` 関数の後半）、`loadConfigOnce` は既に `Do` が実行済みであることを記憶しているため、`loadConfig` は実行されません（「設定ファイルを読み込み中...」は表示されません）。
*   結果として、「設定ファイルを読み込み中...」というメッセージはプログラム全体で厳密に一度だけ表示されます。

`sync.Once` は、複数の Goroutine からアクセスされる可能性がある共有リソースや設定の**初期化処理**を、競合状態を起こさずに安全かつ効率的に一度だけ実行したい場合に非常に便利なツールです。シングルトンパターンの実装などにもよく利用されます。