## タイトル
title: パニックからの回復 `recover`

## タグ
tags: ["flow-control", "panic", "recover", "defer", "エラー処理"]

## コード
```go
package main

import "fmt"

func mightPanic(shouldPanic bool) (result string, err error) {
	// defer + 無名関数 + recover で panic を捕捉
	defer func() {
		if r := recover(); r != nil {
			// panic が発生した場合、r は panic 値
			fmt.Printf("Recovered from panic: %v\n", r)
			// panic を通常の error に変換して返す
			err = fmt.Errorf("内部 panic: %v", r)
		}
	}()

	if shouldPanic {
		fmt.Println("Panic を発生させます...")
		panic("意図的なパニック")
	}

	fmt.Println("Panic は発生しませんでした。")
	result = "正常終了"
	return result, nil // err は nil (ゼロ値)
}

func main() {
	fmt.Println("--- panic する場合 ---")
	res, err := mightPanic(true)
	if err != nil {
		fmt.Printf("エラー: %v\n", err) // recover で設定されたエラー
	} else {
		fmt.Printf("結果: %s\n", res)
	}
	fmt.Println("main 終了 (panic せずに到達)")
}
```

## 解説
```text
`panic` は通常プログラムを異常終了させますが、
組み込み関数 **`recover`** を使うと、
`panic` から**回復**し実行を継続できます。

**`recover` とは？**
`panic` で中断された Goroutine の制御を取り戻す関数です。

**重要ルール:**
`recover` は **`defer` された関数の中で
呼び出された場合にのみ**効果を発揮します。

**動作:**
*   Goroutine が `panic` 中に `defer` 内で `recover()` が
    呼ばれると、`recover` は `panic` に渡された値を返し、
    プログラムの異常終了プロセスが停止します。
    `defer` 関数の完了後、通常の実行が再開されます
    (panic発生関数の呼び出し元に戻る)。
*   `panic` していない場合や `defer` 外で呼ばれた場合、
    `recover` は `nil` を返します。

**使い方: `defer` との組み合わせ**
通常、`defer func() { ... }()` 内で `recover` を呼び出します。
```go
defer func() {
    if r := recover(); r != nil {
        // panic を捕捉した場合の処理
        fmt.Println("Recovered:", r)
        // 必要なら panic を error に変換するなど
    }
}()
```
コード例では `mightPanic(true)` で `panic` が発生しますが、
`defer` 内の `recover` がそれを捕捉し、`error` として
`main` 関数に返しています。そのため、プログラムは
異常終了せず、`main` 関数の最後まで実行されます。

**使い所と注意点:**
*   **ライブラリ:** 内部 panic が利用側プログラム全体を
    クラッシュさせないように、公開関数の入口で使うことがある。
    (panic は通常 error として返す)
*   **Goroutine 保護:** 特定 Goroutine の panic が
    全体に影響しないように使うことがある。
*   **乱用は避ける:** Goでは `error` 型でのエラー処理が基本。
    `panic`/`recover` は例外処理として常用せず、
    回復不能なエラーからの回復など限定的な目的で使う。

`recover` は強力ですが、使用は慎重に行う必要があります。