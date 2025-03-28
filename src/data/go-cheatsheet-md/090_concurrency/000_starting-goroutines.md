---
title: "並行処理: Goroutine (ゴルーチン) の開始"
tags: ["concurrency", "goroutine", "go", "並行処理", "軽量スレッド"]
---

Go言語の大きな特徴の一つが、**並行処理 (Concurrency)** を言語レベルで簡単に扱えることです。その中心的な役割を担うのが **Goroutine (ゴルーチン)** です。

## Goroutine とは？

*   **軽量な実行単位:** Goroutine は、Goのランタイムによって管理される、非常に軽量な実行単位です。OSのスレッドよりもはるかに少ないメモリ消費で、多数（数十万〜数百万）のGoroutineを同時に実行することが可能です。
*   **並行実行:** Goroutineを使うと、複数の処理を**並行 (Concurrent)** に実行できます。これは、複数の処理が見かけ上同時に進行しているように見える状態です（必ずしも物理的に同時に実行されているとは限りません。物理的な同時実行は**並列 (Parallel)** と呼ばれます）。
*   **簡単な起動:** `go` キーワードを使うだけで、関数呼び出しを新しいGoroutineとして簡単に起動できます。

## Goroutine の起動: `go` キーワード

関数呼び出しの前に `go` キーワードを付けるだけで、その関数は新しいGoroutineとして起動され、呼び出し元のGoroutine（例えば `main` 関数を実行しているGoroutine）とは**並行**に実行されます。

**構文:**
```go
// 名前付き関数を Goroutine として起動
go 関数名(引数...)

// 関数リテラル (無名関数) を Goroutine として起動
go func(引数...) {
	// ... 処理 ...
}(引数...)
```

**重要なポイント:** `go` キーワードでGoroutineを起動すると、呼び出し元のGoroutineは、起動したGoroutineの**終了を待たずに**、すぐに次の処理に進みます。

## コード例

```go title="Goroutine の起動と実行"
package main

import (
	"fmt"
	"time"
)

// Goroutine で実行する関数
func say(s string, delay time.Duration) {
	for i := 0; i < 3; i++ {
		fmt.Printf("%s: %d\n", s, i)
		time.Sleep(delay) // 指定された時間だけ待機
	}
	fmt.Printf("%s: 完了\n", s)
}

func main() {
	fmt.Println("main: 開始")

	// --- Goroutine の起動 ---
	// say("Hello", ...) を新しい Goroutine として起動
	go say("Hello", 100*time.Millisecond)
	fmt.Println("main: 'say(\"Hello\")' Goroutine を起動しました。")

	// 関数リテラルを Goroutine として起動
	go func(msg string) {
		fmt.Printf("匿名 Goroutine: %s 開始\n", msg)
		time.Sleep(300 * time.Millisecond)
		fmt.Printf("匿名 Goroutine: %s 終了\n", msg)
	}("メッセージ")
	fmt.Println("main: 匿名 Goroutine を起動しました。")

	// --- main Goroutine の処理 ---
	// 上記の go キーワードの後、main Goroutine は待たずにすぐここに進む
	fmt.Println("main: 他の処理を実行中...")
	time.Sleep(50 * time.Millisecond) // main も少しだけ処理をしているふり

	fmt.Println("main: 終了を待たずに進みます...")

	// --- Goroutine の終了待ち (不適切な例) ---
	// もし main 関数がここで終了してしまうと、起動した他の Goroutine は
	// 処理の途中でも強制的に終了させられてしまう。
	// time.Sleep は、Goroutine が終わるのを待つための信頼できる方法ではない！
	// (完了に必要な時間が正確に分からないため)
	// ここではデモのために一時的に使用するが、実際のコードでは避けるべき。
	fmt.Println("main: Goroutine の完了を少し待ちます (悪い例)...")
	time.Sleep(500 * time.Millisecond) // 500ミリ秒待つ

	fmt.Println("main: 終了")
	// main が終了するとプログラム全体が終了する
}

/* 実行結果の例 (Goroutine の出力順序は実行ごとに変わる可能性あり):
main: 開始
main: 'say("Hello")' Goroutine を起動しました。
main: 匿名 Goroutine を起動しました。
main: 他の処理を実行中...
Hello: 0
匿名 Goroutine: メッセージ 開始
main: 終了を待たずに進みます...
main: Goroutine の完了を少し待ちます (悪い例)...
Hello: 1
Hello: 2
匿名 Goroutine: メッセージ 終了
Hello: 完了
main: 終了
*/
```

**コード解説:**

*   `go say("Hello", ...)`: `say` 関数を新しいGoroutineとして起動します。`main` 関数はこのGoroutineの終了を待たずに次の行に進みます。
*   `go func(...) { ... }("メッセージ")`: 関数リテラルを定義し、その場で `go` キーワードを使ってGoroutineとして起動しています。
*   `time.Sleep()`: プログラムの実行を一時停止します。ここでは、`main` 関数がすぐに終了してしまい、起動したGoroutineが実行される前にプログラムが終わってしまうのを**一時的に防ぐ**ために使っていますが、これは**非常に悪い方法**です。Goroutineの完了を保証するものではありません。
*   **実行順序の不定性:** `main`, `say("Hello")`, 匿名の各Goroutineは並行に実行されるため、`fmt.Println` の出力順序は実行ごとに変わる可能性があります。

**重要な課題:** `main` 関数（またはGoroutineを起動した関数）が、起動したGoroutineの処理完了を待たずに終了してしまうと、起動されたGoroutineも途中で終了してしまいます。これを解決するには、**同期 (Synchronization)** の仕組みが必要です。

次のセクションでは、Goroutineの終了を適切に待つための基本的な方法である `sync.WaitGroup` について説明します。