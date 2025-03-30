## タイトル
title: アトミックポインタ (`atomic.Pointer[T]`, Go 1.19+)

## タグ
tags: ["concurrency", "goroutine", "sync", "atomic", "Pointer", "アトミック操作", "ポインタ", "型安全", "Go1.19"]

## コード
```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

type Config struct { Version string; APIKey string }

// Config へのポインタをアトミックに保持
var currentConfig atomic.Pointer[Config]

// 設定読み取り (アトミックにポインタ取得)
func configReader(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	cfg := currentConfig.Load() // アトミックにポインタ取得
	if cfg != nil {
		fmt.Printf("Reader %d: Read Ver='%s'\n", id, cfg.Version)
	} else {
		fmt.Printf("Reader %d: Config nil\n", id)
	}
}

// 設定更新 (アトミックにポインタ設定)
func configUpdater(newCfg *Config, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Updater: Set Ver='%s'\n", newCfg.Version)
	currentConfig.Store(newCfg) // アトミックにポインタ設定
	// ok := currentConfig.CompareAndSwap(oldCfg, newCfg) // CASも可能
}

func main() {
	var wg sync.WaitGroup
	initialCfg := &Config{Version: "v1"}
	currentConfig.Store(initialCfg) // 初期設定

	wg.Add(2)
	go configReader(1, &wg)
	go configUpdater(&Config{Version: "v2"}, &wg)
	wg.Wait()

	finalCfg := currentConfig.Load()
	fmt.Printf("Final Version: %s\n", finalCfg.Version) // v2
}

```

## 解説
```text
`sync/atomic` パッケージは**ポインタ**のアトミック操作もサポートします。
Go 1.19+ では、ジェネリクスを使った型安全な
**`atomic.Pointer[T]`** 型が導入され、任意の型 `T` への
ポインタ (`*T`) をアトミックに扱えます。
`import "sync/atomic"` で利用します。

これは、アプリケーション設定構造体へのポインタなどを、
複数の Goroutine から安全に読み書き（差し替え）する場合に役立ちます。

**使い方:**
1. `var cfgPtr atomic.Pointer[MyConfig]` のように、
   `atomic.Pointer[T]` 型で変数を宣言。
2. メソッドで操作。

**主なメソッド:** (整数型と同様)
*   `Load() *T`: 現在のポインタ値をアトミックに読み取り。
*   `Store(new *T)`: 新しいポインタ `new` をアトミックに書き込み。
*   `Swap(new *T) (old *T)`: `new` を書き込み、古いポインタを返す。
*   `CompareAndSwap(old, new *T) bool`: 現在値が `old` なら
    `new` に更新し `true` を返す (CAS)。

コード例では `atomic.Pointer[Config]` を使い、
`configReader` が `Load()` で安全に現在の設定ポインタを取得し、
`configUpdater` が `Store()` で安全に新しい設定ポインタに
差し替えています。

**注意点:**
*   `atomic.Pointer` はポインタ値自体の読み書きをアトミックにしますが、
    **ポインタが指す先のデータ内容までは保護しません**。
    指す先の構造体のフィールドを変更する場合は別途 Mutex 等が必要です。
*   主にポインタを**差し替える**操作（設定更新、キャッシュ入替等）を
    アトミックに行いたい場合に有効です。

`atomic.Pointer[T]` は Go 1.19+ でポインタのアトミック操作を行う
型安全で推奨される方法です。