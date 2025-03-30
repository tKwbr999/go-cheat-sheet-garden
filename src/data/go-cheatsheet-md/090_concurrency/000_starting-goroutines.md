## タイトル
title: Goroutine (ゴルーチン) の開始

## タグ
tags: ["concurrency", "goroutine", "go", "並行処理", "軽量スレッド"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// Goroutine で実行する関数
func say(s string) {
	for i := 0; i < 3; i++ {
		fmt.Printf("%s: %d\n", s, i)
		time.Sleep(100 * time.Millisecond)
	}
	fmt.Printf("%s: 完了\n", s)
}

func main() {
	fmt.Println("main: 開始")

	// say 関数を新しい Goroutine として起動
	go say("Hello")
	fmt.Println("main: say(\"Hello\") Goroutine 起動")

	// 匿名関数も Goroutine で起動可能
	// go func(msg string) { ... }("メッセージ")

	fmt.Println("main: 他の処理...")
	time.Sleep(50 * time.Millisecond)

	// ★ 注意: main がここで終了すると say Goroutine も終了してしまう
	//          完了を待つ必要がある (次のセクションで解説)
	//          time.Sleep は不確実なため、実際のコードでは使わない！
	fmt.Println("main: 少し待機 (悪い例)...")
	time.Sleep(500 * time.Millisecond)

	fmt.Println("main: 終了")
}

```

## 解説
```text
Goの**並行処理 (Concurrency)** の中心が **Goroutine** です。

**Goroutine とは？**
*   **軽量な実行単位:** OSスレッドより遥かに軽量で多数実行可能。
*   **並行実行:** 複数の処理が見かけ上同時に進行する。
    (物理的な同時実行は**並列 Parallel**)
*   **簡単な起動:** `go` キーワードで関数呼び出しを起動。

**Goroutine の起動: `go` キーワード**
関数呼び出しの前に `go` を付けると、その関数は新しい
Goroutine として起動され、呼び出し元とは**並行**に実行されます。
**構文:**
```go
go 関数名(引数...)
go func(引数...) { ... }(引数...) // 匿名関数
```

**重要:** `go` で Goroutine を起動すると、呼び出し元は
起動した Goroutine の**終了を待たずに**次の処理に進みます。

コード例では `go say("Hello")` で `say` 関数を別 Goroutine で
起動しています。`main` 関数は `say` の完了を待たずに
`fmt.Println("main: 他の処理...")` を実行します。

**課題:** `main` 関数が先に終了すると、起動した Goroutine も
途中で終了してしまいます。コード例の最後の `time.Sleep` は
デモ用の一時しのぎであり、**実際のコードでは使ってはいけません**。
Goroutine の完了を確実に待つには**同期**が必要です。
(次項 `sync.WaitGroup` 参照)