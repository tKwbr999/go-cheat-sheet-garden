---
title: "制御構文: パニック `panic`"
tags: ["flow-control", "panic", "エラー処理", "defer", "ランタイムエラー"]
---

Go言語には、プログラムの実行中に**回復不能なエラー**が発生したことを示すための仕組みとして **`panic`** があります。`panic` は組み込み関数で、呼び出されるとその Goroutine の通常の実行フローが**即座に停止**します。

## `panic` とは？

`panic` は、予期しない、あるいはプログラムの継続が不可能になるような深刻な状況が発生したことを示すシグナルです。例えば、配列の範囲外アクセス、`nil` ポインタへのアクセスといったランタイムエラーが発生した場合、Goのランタイムが自動的に `panic` を引き起こします。

また、プログラマが意図的に `panic` 関数を呼び出すことも可能です。これは通常、プログラムの設計上、発生してはならないはずの状況（例えば、必須の設定ファイルが見つからない、ライブラリの初期化に失敗するなど）で使われます。

**`panic` は通常の `error` 型を使ったエラー処理とは異なります。** `error` は予期されるエラー（ファイルが見つからない、ネットワーク接続が切れたなど）を扱うためのもので、呼び出し元が適切に処理することが期待されます。一方、`panic` はより深刻で、通常はプログラムのバグや回復不能な状態を示します。

## `panic` が発生するとどうなるか？

1.  現在の関数の実行が停止します。
2.  その関数内で `defer` されていた関数呼び出しが**通常通り実行**されます（LIFO順）。
3.  `defer` の実行が終わると、呼び出し元の関数に処理が戻り、そこでも `defer` が実行されます。
4.  これが Goroutine のスタックのトップまで繰り返されます。
5.  最終的に、プログラムは**異常終了**し、パニックの値（`panic` に渡された引数）と**スタックトレース**（どこで `panic` が発生したかの呼び出し履歴）が標準エラー出力に表示されます。

## `panic` の例

```go title="panic の発生例"
package main

import "fmt"

// ゼロ除算を引き起こす関数
func divide(a, b int) int {
	fmt.Printf("divide(%d, %d) を呼び出し\n", a, b)
	// defer は panic が発生しても実行される
	defer fmt.Printf("divide(%d, %d) 終了\n", a, b)

	if b == 0 {
		// 意図的に panic を呼び出す
		panic("ゼロ除算エラー！") // panic には任意の値を渡せる (通常は文字列か error)
	}
	// panic が発生した場合、この return は実行されない
	return a / b
}

// 配列の範囲外アクセス (ランタイムが panic を引き起こす)
func accessOutOfBounds() {
	fmt.Println("accessOutOfBounds を呼び出し")
	defer fmt.Println("accessOutOfBounds 終了")
	arr := []int{1, 2, 3}
	fmt.Println("範囲外アクセス試行...")
	// arr[3] は存在しないため、ランタイムパニックが発生する
	fmt.Println(arr[3])
	fmt.Println("この行は実行されない")
}

func main() {
	fmt.Println("--- 意図的な panic ---")
	// divide(10, 0) // この行のコメントを外すと panic が発生する
	fmt.Println("divide(10, 2) の結果:", divide(10, 2))

	fmt.Println("\n--- ランタイム panic ---")
	// accessOutOfBounds() // この行のコメントを外すと panic が発生する
	fmt.Println("ランタイム panic の例はコメントアウトされています。")

	fmt.Println("\nmain 関数終了")
}

/* divide(10, 0) のコメントを外した場合の実行例:
--- 意図的な panic ---
divide(10, 0) を呼び出し
divide(10, 0) 終了
panic: ゼロ除算エラー！

goroutine 1 [running]:
main.divide(0xa, 0x0)
        /path/to/your/file.go:12 +0xbf
main.main()
        /path/to/your/file.go:30 +0x8f
exit status 2
*/

/* accessOutOfBounds() のコメントを外した場合の実行例:
--- ランタイム panic ---
accessOutOfBounds を呼び出し
範囲外アクセス試行...
accessOutOfBounds 終了
panic: runtime error: index out of range [3] with length 3

goroutine 1 [running]:
main.accessOutOfBounds()
        /path/to/your/file.go:23 +0x9c
main.main()
        /path/to/your/file.go:34 +0x10b
exit status 2
*/

/* コメントアウトしたままの実行結果:
--- 意図的な panic ---
divide(10, 2) を呼び出し
divide(10, 2) 終了
divide(10, 2) の結果: 5

--- ランタイム panic ---
ランタイム panic の例はコメントアウトされています。

main 関数終了
*/
```

**コード解説:**

*   `divide` 関数では、`b` が `0` の場合に `panic("ゼロ除算エラー！")` を呼び出しています。
*   `accessOutOfBounds` 関数では、存在しないインデックス `arr[3]` にアクセスしようとしており、これはGoのランタイムによって検出され、自動的に `panic` が発生します。
*   どちらの場合も、`panic` が発生すると、その関数内の `defer` 文（`defer fmt.Printf(...)` や `defer fmt.Println(...)`）が実行された後、プログラムがスタックトレースを出力して終了します。`panic` が発生した行以降の通常の処理（`return a / b` や `fmt.Println("この行は実行されない")`）は実行されません。

`panic` はプログラムをクラッシュさせる可能性があるため、**むやみに使うべきではありません**。ライブラリなどでは、よほどのことがない限り `panic` を使わず、`error` 型を返すべきです。アプリケーションレベルで、本当に回復不能な致命的なエラーが発生した場合にのみ、`panic` の使用を検討します。

次のセクションでは、`panic` から回復するための `recover` について説明します。