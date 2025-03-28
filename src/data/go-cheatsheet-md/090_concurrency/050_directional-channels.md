---
title: "並行処理: 方向付きチャネル (Directional Channels)"
tags: ["concurrency", "channel", "goroutine", "方向付きチャネル", "送信専用", "受信専用", "型安全性"]
---

チャネルは通常、値の**送信**と**受信**の両方が可能です（双方向チャネル）。しかし、関数の引数や戻り値としてチャネルを渡す際に、そのチャネルが**送信専用**なのか**受信専用**なのかを**型レベルで明示**したい場合があります。これを実現するのが**方向付きチャネル (Directional Channels)** です。

## 方向付きチャネルとは？ なぜ使うのか？

方向付きチャネルを使うと、チャネルに対して行える操作をコンパイル時に制限できます。

*   **送信専用チャネル (`chan<- T`):** この型のチャネルには、値の**送信 (`ch <- value`) のみが許可**されます。受信 (`<-ch`) やクローズ (`close(ch)`) を試みるとコンパイルエラーになります。
*   **受信専用チャネル (`<-chan T`):** この型のチャネルからは、値の**受信 (`value := <-ch`) のみが許可**されます。送信 (`ch <- value`) やクローズ (`close(ch)`) を試みるとコンパイルエラーになります。

**利点:**

*   **型安全性:** 関数のシグネチャを見るだけで、その関数がチャネルに対して送信のみを行うのか、受信のみを行うのかが明確になります。これにより、意図しない操作（受信専用チャネルに送信しようとするなど）をコンパイル時に防ぐことができます。
*   **役割の明確化:** コードの設計意図がより明確になります。例えば、データを生成してチャネルに送る関数（プロデューサー）の引数は送信専用チャネル (`chan<- T`) にし、データを受け取って処理する関数（コンシューマー）の引数は受信専用チャネル (`<-chan T`) にするといった使い方ができます。

## 宣言と変換

*   **送信専用:** `var sendOnly chan<- int`
*   **受信専用:** `var receiveOnly <-chan int`

通常の**双方向チャネル (`chan T`)** は、送信専用チャネル (`chan<- T`) または受信専用チャネル (`<-chan T`) が期待される場所に**代入可能**です。しかし、その逆（方向付きチャネルを双方向チャネルに代入する）はできません。

```go title="方向付きチャネルの宣言と変換"
package main

import "fmt"

// 送信専用チャネルを受け取る関数
func producer(out chan<- string) { // out は string を送信しかできない
	fmt.Println("Producer: 送信開始")
	out <- "データ1"
	// msg := <-out // コンパイルエラー: invalid operation: cannot receive from send-only channel out (variable of type chan<- string)
	// close(out)   // 送信専用チャネルはクローズできない (通常は双方向チャネルを渡した呼び出し元がクローズする)
	fmt.Println("Producer: 送信完了")
	// この関数内ではクローズできないので、呼び出し元でクローズする必要がある
}

// 受信専用チャネルを受け取る関数
func consumer(in <-chan string) { // in は string を受信しかできない
	fmt.Println("Consumer: 受信開始")
	msg := <-in // 受信は OK
	fmt.Printf("Consumer: 受信: %s\n", msg)
	// in <- "データ2" // コンパイルエラー: invalid operation: cannot send to receive-only channel in (variable of type <-chan string)
	// close(in)     // 受信専用チャネルはクローズできない
	fmt.Println("Consumer: 受信完了")
}

func main() {
	// 通常の双方向チャネルを作成
	ch := make(chan string, 1) // バッファ 1

	// --- 双方向チャネルを方向付きチャネルに渡す ---
	// producer 関数には送信専用チャネルが必要だが、双方向チャネル ch を渡せる
	go producer(ch)
	// consumer 関数には受信専用チャネルが必要だが、双方向チャネル ch を渡せる
	consumer(ch)

	// --- 方向付きチャネル型の変数 ---
	var sendOnly chan<- int   // 送信専用チャネル変数 (nil)
	var receiveOnly <-chan int // 受信専用チャネル変数 (nil)
	bidirectional := make(chan int) // 双方向チャネル

	sendOnly = bidirectional    // OK: 双方向を送信専用に代入
	receiveOnly = bidirectional // OK: 双方向を受信専用に代入

	// sendOnly = receiveOnly // コンパイルエラー: cannot use receiveOnly (variable of type <-chan int) as chan<- int value in assignment
	// receiveOnly = sendOnly // コンパイルエラー: cannot use sendOnly (variable of type chan<- int) as <-chan int value in assignment
	// bidirectional = sendOnly // コンパイルエラー

	// 簡単な送受信の例
	go func(so chan<- int) {
		fmt.Println("\nGoroutine: 送信中...")
		so <- 123
		// close(so) // 送信専用なのでクローズ不可
	}(sendOnly) // 送信専用チャネルを渡す

	receivedValue := <-receiveOnly // 受信専用チャネルから受信
	fmt.Printf("受信した値: %d\n", receivedValue)

	close(bidirectional) // 元の双方向チャネルをクローズする必要がある
}

/* 実行結果:
Producer: 送信開始
Producer: 送信完了
Consumer: 受信開始
Consumer: 受信: データ1
Consumer: 受信完了

Goroutine: 送信中...
受信した値: 123
*/
```

**コード解説:**

*   `producer` 関数は引数 `out` を `chan<- string` (送信専用) として宣言しています。この関数内では `out` への送信 (`out <- ...`) のみが可能です。
*   `consumer` 関数は引数 `in` を `<-chan string` (受信専用) として宣言しています。この関数内では `in` からの受信 (`<-in`) のみが可能です。
*   `main` 関数では、通常の双方向チャネル `ch` を作成し、それを `producer` と `consumer` に渡しています。Goが自動的に型を変換してくれるため、これは問題なく動作します。
*   `sendOnly = bidirectional` や `receiveOnly = bidirectional` のように、双方向チャネルは方向付きチャネル型の変数に代入できます。
*   しかし、逆方向の代入や、方向付きチャネルから双方向チャネルへの代入はコンパイルエラーになります。

方向付きチャネルは、関数のシグネチャをより明確にし、チャネルの誤用を防ぐのに役立ちます。特に、チャネルを生成する側と消費する側が異なる関数やパッケージにある場合に、それぞれの役割をコード上で明確に示すことができます。