## タイトル
title: パニック `panic`

## タグ
tags: ["flow-control", "panic", "エラー処理", "defer", "ランタイムエラー"]

## コード
```go
package main

import "fmt"

func divide(a, b int) int {
	fmt.Printf("divide(%d, %d) 呼び出し\n", a, b)
	defer fmt.Printf("divide(%d, %d) 終了\n", a, b) // panic でも実行される

	if b == 0 {
		panic("ゼロ除算エラー！") // 意図的な panic
	}
	return a / b // panic が発生すると実行されない
}

func main() {
	fmt.Println("--- 意図的な panic ---")
	// divide(10, 0) // コメント解除で panic 発生
	fmt.Println("divide(10, 2) 結果:", divide(10, 2))

	fmt.Println("\nmain 関数終了")
}

/*
divide(10, 0) 実行時の出力例:
--- 意図的な panic ---
divide(10, 0) 呼び出し
divide(10, 0) 終了
panic: ゼロ除算エラー！

goroutine 1 [running]:
main.divide(...)
        ...
main.main()
        ...
exit status 2
*/
```

## 解説
```text
Goの **`panic`** は、プログラム実行中に
**回復不能なエラー**が発生したことを示す仕組みです。
組み込み関数 `panic()` を呼び出すか、
ランタイムエラー (配列範囲外アクセス、nilポインタ参照等) が
発生すると `panic` が起きます。

**`panic` と `error` の違い:**
*   `error`: 予期されるエラー (ファイル無し等)。呼び出し元での処理を期待。
*   `panic`: 予期しない深刻な状況 (バグ、回復不能状態)。

**`panic` が発生すると:**
1. 現在の関数の実行が停止。
2. その関数の `defer` 文が LIFO 順で実行される。
3. 呼び出し元に関数が戻り、そこでも `defer` が実行される (スタックを遡る)。
4. Goroutine のトップまで達すると、プログラムは**異常終了**し、
   パニック値と**スタックトレース**を出力する。

コード例では `divide(10, 0)` を呼び出すと、
`b == 0` の条件で `panic("ゼロ除算エラー！")` が
実行されます。`defer` 文は実行されますが、
`return a / b` は実行されず、プログラムは異常終了します。

**注意点:**
`panic` はプログラムをクラッシュさせる可能性があるため、
**むやみに使うべきではありません**。
ライブラリでは `panic` を避け `error` を返すのが基本です。
アプリケーションレベルで、本当に回復不能な致命的エラーの
場合にのみ使用を検討します。

(関連: `recover` で `panic` から回復することも可能)