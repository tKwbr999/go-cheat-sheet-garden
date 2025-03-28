---
title: "並行処理: アトミックポインタ (`atomic.Pointer[T]`, Go 1.19+)"
tags: ["concurrency", "goroutine", "sync", "atomic", "Pointer", "アトミック操作", "ポインタ", "型安全", "Go1.19"]
---

`sync/atomic` パッケージは、整数型だけでなく、**ポインタ**に対するアトミック操作もサポートしています。Go 1.19 以降では、ジェネリクスを使った型安全な **`atomic.Pointer[T]`** 型が導入され、任意の型 `T` へのポインタ (`*T`) をアトミックに扱うことができます。

これは、例えば、アプリケーションの設定情報を保持する構造体へのポインタを、複数の Goroutine から安全に読み取ったり、新しい設定情報にアトミックに更新したりするような場合に役立ちます。

## `atomic.Pointer[T]` の使い方

`import "sync/atomic"` として利用します。

1.  アトミックに操作したいポインタの型 `*T` に対して、`atomic.Pointer[T]` 型の変数を宣言します。
    ```go
    type MyConfig struct { /* ... fields ... */ }
    var configPtr atomic.Pointer[MyConfig] // *MyConfig をアトミックに扱う
    ```
2.  その型のメソッドを使ってアトミック操作を行います。

**主なメソッド:** (整数型と同様)

*   **`Load() *T`**: 現在のポインタ値をアトミックに読み取ります。
*   **`Store(new *T)`**: 新しいポインタ値 `new` をアトミックに書き込みます。
*   **`Swap(new *T) (old *T)`**: 新しいポインタ値 `new` をアトミックに書き込み、**書き込む前の古いポインタ値**を返します。
*   **`CompareAndSwap(old, new *T) (swapped bool)`**: 現在のポインタ値が `old` と等しければ、値を `new` にアトミックに更新し `true` を返します。等しくなければ何もせず `false` を返します (CAS操作)。

## コード例: 設定ポインタの更新

アプリケーションの設定情報を保持する `Config` 構造体へのポインタを、複数の Goroutine が参照し、時々新しい設定にアトミックに更新する例を見てみましょう。

```go title="atomic.Pointer による設定ポインタの安全な更新"
package main

import (
	"fmt"
	"sync"
	"sync/atomic" // atomic パッケージをインポート
	"time"
)

// 設定情報を保持する構造体
type Config struct {
	Version string
	APIKey  string
}

// 現在の設定へのポインタを保持するアトミックポインタ
// var currentConfig atomic.Pointer[Config] // Go 1.19+
// Go 1.18 以前は atomic.Value が使われたが、型安全性が低かった
var currentConfig atomic.Pointer[Config]

// 設定を読み込む Goroutine
func configReader(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	// Load で現在の Config ポインタをアトミックに取得
	cfg := currentConfig.Load()
	if cfg == nil {
		fmt.Printf("Reader %d: 設定はまだロードされていません。\n", id)
		return
	}
	// 取得したポインタを通じてフィールドにアクセス
	fmt.Printf("Reader %d: 設定バージョン '%s', APIキー '%s' を読み取りました。\n", id, cfg.Version, cfg.APIKey)
}

// 設定を更新する Goroutine
func configUpdater(newCfg *Config, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Updater: 新しい設定 (バージョン '%s') に更新しようとしています...\n", newCfg.Version)

	// Store で新しい Config ポインタをアトミックに設定
	currentConfig.Store(newCfg)

	// または、CAS を使って特定の古い設定から更新することもできる
	// oldCfg := currentConfig.Load()
	// if currentConfig.CompareAndSwap(oldCfg, newCfg) {
	// 	fmt.Printf("Updater: 設定をバージョン '%s' に更新しました。\n", newCfg.Version)
	// } else {
	// 	fmt.Printf("Updater: 設定の更新に失敗しました (既に変更されていました)。\n")
	// }

	fmt.Printf("Updater: 設定をバージョン '%s' に更新しました。\n", newCfg.Version)
}

func main() {
	var wg sync.WaitGroup

	// 初期設定 (v1)
	initialCfg := &Config{Version: "v1.0", APIKey: "key-abc"}
	currentConfig.Store(initialCfg) // Store で初期値を設定

	fmt.Println("--- 初期設定読み取り ---")
	wg.Add(2)
	go configReader(1, &wg)
	go configReader(2, &wg)
	wg.Wait()

	// 新しい設定 (v2) を準備
	newCfg := &Config{Version: "v2.0", APIKey: "key-xyz-updated"}

	fmt.Println("\n--- 設定更新と読み取りを並行実行 ---")
	wg.Add(5) // リーダー3つとアップデーター1つ + 最後のリーダー1つ
	go configReader(3, &wg) // 更新前に読み取るリーダー
	go configReader(4, &wg) // 更新前に読み取るリーダー
	go configUpdater(newCfg, &wg) // 設定を更新するアップデーター
	time.Sleep(10 * time.Millisecond) // アップデーターが実行される可能性を高める
	go configReader(5, &wg) // 更新中または更新後に読み取るリーダー
	go configReader(6, &wg) // 更新後に読み取るリーダー

	wg.Wait() // すべての Goroutine の完了を待つ

	fmt.Println("\n--- 最終確認 ---")
	finalCfg := currentConfig.Load()
	fmt.Printf("最終設定バージョン: %s\n", finalCfg.Version)
}

/* 実行結果の例 (Goroutine の実行順序により多少前後する可能性あり):
--- 初期設定読み取り ---
Reader 1: 設定バージョン 'v1.0', APIキー 'key-abc' を読み取りました。
Reader 2: 設定バージョン 'v1.0', APIキー 'key-abc' を読み取りました。

--- 設定更新と読み取りを並行実行 ---
Reader 3: 設定バージョン 'v1.0', APIキー 'key-abc' を読み取りました。
Reader 4: 設定バージョン 'v1.0', APIキー 'key-abc' を読み取りました。
Updater: 新しい設定 (バージョン 'v2.0') に更新しようとしています...
Updater: 設定をバージョン 'v2.0' に更新しました。
Reader 5: 設定バージョン 'v2.0', APIキー 'key-xyz-updated' を読み取りました。
Reader 6: 設定バージョン 'v2.0', APIキー 'key-xyz-updated' を読み取りました。

--- 最終確認 ---
最終設定バージョン: v2.0
*/
```

**コード解説:**

*   `var currentConfig atomic.Pointer[Config]`: `*Config` 型のポインタをアトミックに保持するための変数を宣言します。
*   `configReader` 関数は `currentConfig.Load()` を使って、現在の `*Config` を安全に読み取ります。読み取り操作自体はアトミックですが、読み取ったポインタが指す先の構造体の**フィールドへのアクセスはアトミックではありません**。もし構造体のフィールドも頻繁に更新される場合は、フィールドごとにアトミック型を使うか、`RWMutex` で構造体全体を保護する必要があります。この例では、ポインタの差し替えのみをアトミックに行っています。
*   `configUpdater` 関数は `currentConfig.Store(newCfg)` を使って、保持しているポインタを新しい `*Config` (`newCfg`) にアトミックに差し替えます。これにより、他の Goroutine が中途半端な状態でポインタを参照することはありません。
*   `main` 関数では、初期設定後、複数のリーダーと1つのアップデーターを並行して実行しています。実行結果から、アップデーターが実行された後には、リーダーが新しい設定 (v2.0) を読み取っていることがわかります。

**注意点:**

*   `atomic.Pointer` はポインタ値自体の読み書きをアトミックに行いますが、ポインタが指す先の**データの内容**までアトミックに保護するわけではありません。ポインタが指す先のデータを変更する場合は、別途 Mutex などで保護する必要があります。
*   `atomic.Pointer` は、主にポインタを**差し替える**操作（例: 設定の更新、キャッシュの入れ替え）をアトミックに行いたい場合に有効です。

`atomic.Pointer[T]` は、Go 1.19 以降でポインタのアトミック操作を行うための、型安全で推奨される方法です。