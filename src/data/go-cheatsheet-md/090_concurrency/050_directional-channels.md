## タイトル
title: 方向付きチャネル (Directional Channels)

## タグ
tags: ["concurrency", "channel", "goroutine", "方向付きチャネル", "送信専用", "受信専用", "型安全性"]

## コード
```go
package main

import "fmt"

// 送信専用チャネル (chan<- string) を受け取る関数
func producer(out chan<- string) {
	fmt.Println("Producer: 送信開始")
	out <- "データ" // 送信のみ可能
	// <-out // 受信はコンパイルエラー
	fmt.Println("Producer: 送信完了")
	// close(out) // 送信専用はクローズ不可
}

// 受信専用チャネル (<-chan string) を受け取る関数
func consumer(in <-chan string) {
	fmt.Println("Consumer: 受信開始")
	msg := <-in // 受信のみ可能
	fmt.Printf("Consumer: 受信: %s\n", msg)
	// in <- "x" // 送信はコンパイルエラー
	fmt.Println("Consumer: 受信完了")
}

func main() {
	// 通常の双方向チャネルを作成
	ch := make(chan string, 1)

	// 双方向チャネルを方向付きチャネルとして渡せる
	go producer(ch) // producer は chan<- string を期待
	consumer(ch)    // consumer は <-chan string を期待

	close(ch) // クローズは元の双方向チャネルで行う
}

```

## 解説
```text
チャネルは通常、送受信可能（双方向）ですが、
関数の引数等で**送信専用**か**受信専用**かを
**型レベルで明示**するのが**方向付きチャネル**です。

**種類と操作制限:**
*   **送信専用 (`chan<- T`):**
    *   送信 (`ch <- value`) のみ可能。
    *   受信 (`<-ch`)、クローズ (`close(ch)`) はコンパイルエラー。
*   **受信専用 (`<-chan T`):**
    *   受信 (`value := <-ch`) のみ可能。
    *   送信 (`ch <- value`)、クローズ (`close(ch)`) はコンパイルエラー。

**利点:**
*   **型安全性:** 関数のシグネチャでチャネルの用途が明確になり、
    意図しない操作 (受信専用への送信等) をコンパイル時に防げる。
*   **役割明確化:** プロデューサー関数は `chan<- T` を、
    コンシューマー関数は `<-chan T` を引数に取るなど、
    設計意図を明確に示せる。

**宣言と変換:**
*   `var sendOnly chan<- int`
*   `var receiveOnly <-chan int`
*   通常の**双方向チャネル (`chan T`)** は、
    送信専用 (`chan<- T`) や受信専用 (`<-chan T`) が
    期待される場所に**代入可能**です (コード例の関数呼び出し参照)。
*   逆方向（方向付きを双方向へ）や、送信専用を受信専用へ
    (またはその逆) の代入はできません。

コード例では、`producer` は送信専用、`consumer` は受信専用チャネルを
引数に取りますが、`main` では双方向チャネル `ch` を渡せています。
チャネルのクローズは、通常、元の双方向チャネルを持つ側
(この例では `main`) が行います。

方向付きチャネルは、関数のシグネチャを明確にし、
チャネルの誤用を防ぐのに役立ちます。