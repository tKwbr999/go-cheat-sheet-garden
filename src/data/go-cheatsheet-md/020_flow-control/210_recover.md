---
title: "制御構文: パニックからの回復 `recover`"
tags: ["flow-control", "panic", "recover", "defer", "エラー処理"]
---

`panic` は通常、プログラムを異常終了させますが、Goには `panic` から**回復 (Recover)** し、プログラムの実行を継続させるための仕組みも用意されています。それが組み込み関数の **`recover`** です。

## `recover` とは？

`recover` は、`panic` によって中断された Goroutine の制御を取り戻すための関数です。

**重要なルール:** `recover` は、**`defer` された関数の中で呼び出された場合にのみ**効果を発揮します。

*   もし Goroutine が `panic` している最中で、かつ `defer` された関数内で `recover` が呼び出されると、`recover` は `panic` に渡された値（`panic` の引数）を返します。そして、プログラムの異常終了プロセスが停止し、`defer` された関数の実行が完了した後、通常の実行フローが再開されます（`panic` が発生した関数の呼び出し元に戻る）。
*   もし Goroutine が `panic` していない場合、または `defer` された関数以外で `recover` が呼び出された場合、`recover` は `nil` を返し、他に何も起こりません。

## `recover` の使い方: `defer` との組み合わせ

`panic` から回復するには、通常、以下のようなパターンで `defer` と `recover` を組み合わせます。

```go title="recover を使った panic からの回復"
package main

import (
	"fmt"
)

// panic を起こす可能性のある関数
func mightPanic(shouldPanic bool) (result string, err error) {
	fmt.Println("mightPanic: 開始")

	// ★ defer された無名関数の中で recover を呼び出す
	defer func() {
		fmt.Println("mightPanic: defer 実行開始")
		// recover() を呼び出す
		if r := recover(); r != nil {
			// panic が発生した場合、r には panic に渡された値が入る
			fmt.Printf("mightPanic: panic を recover しました: %v\n", r)
			// panic を通常の error に変換して関数の戻り値とする
			err = fmt.Errorf("内部で panic が発生しました: %v", r)
			// result は string のゼロ値 "" のまま
		}
		fmt.Println("mightPanic: defer 実行終了")
	}() // 無名関数を定義してすぐに呼び出す

	if shouldPanic {
		fmt.Println("mightPanic: panic を発生させます！")
		panic("意図的なパニック") // panic を発生させる
		// panic が発生すると、これ以降の行は実行されない
		// fmt.Println("この行は実行されない")
	}

	// panic が発生しなかった場合の正常処理
	fmt.Println("mightPanic: panic は発生しませんでした。")
	result = "正常終了"
	err = nil // エラーなし
	return result, err
}

func main() {
	fmt.Println("--- panic しない場合 ---")
	res1, err1 := mightPanic(false)
	if err1 != nil {
		fmt.Printf("エラー: %v\n", err1)
	} else {
		fmt.Printf("結果: %s\n", res1)
	}

	fmt.Println("\n--- panic する場合 ---")
	res2, err2 := mightPanic(true) // ここで mightPanic 内で panic が発生する
	// しかし、defer 内の recover によってプログラムは終了せず、err2 にエラー情報が入る
	if err2 != nil {
		fmt.Printf("エラー: %v\n", err2) // recover によって設定されたエラーが表示される
	} else {
		fmt.Printf("結果: %s\n", res2) // こちらは実行されないはず
	}

	fmt.Println("\nmain 関数終了") // プログラムは panic で終了せずにここまで到達する
}

/* 実行結果:
--- panic しない場合 ---
mightPanic: 開始
mightPanic: panic は発生しませんでした。
mightPanic: defer 実行開始
mightPanic: defer 実行終了
結果: 正常終了

--- panic する場合 ---
mightPanic: 開始
mightPanic: panic を発生させます！
mightPanic: defer 実行開始
mightPanic: panic を recover しました: 意図的なパニック
mightPanic: defer 実行終了
エラー: 内部で panic が発生しました: 意図的なパニック

main 関数終了
*/
```

**コード解説:**

1.  `mightPanic` 関数内で `defer func() { ... }()` を使って無名関数を遅延実行するように登録します。
2.  その無名関数の中で `if r := recover(); r != nil { ... }` を実行します。
    *   `recover()`: もし `mightPanic` 関数（またはそれが呼び出す関数）のどこかで `panic` が発生していれば、`panic` に渡された値を返します。発生していなければ `nil` を返します。
    *   `r != nil`: `recover()` が `nil` 以外を返した場合、つまり `panic` が発生した場合の処理を行います。
    *   `err = fmt.Errorf(...)`: 捕捉した `panic` の値 `r` を使って、通常の `error` 型の値を作成し、関数の戻り値 `err` に設定します。これにより、`panic` を通常の（処理可能な）エラーとして呼び出し元に伝えることができます。
3.  `main` 関数では、`mightPanic(true)` を呼び出すと内部で `panic` が発生しますが、`defer` 内の `recover` がそれを捕捉します。
4.  `mightPanic` 関数は `panic` で異常終了する代わりに、`recover` によって設定された `error` 値を返します。
5.  `main` 関数は `err2 != nil` が `true` になるため、エラーメッセージを表示し、プログラムは正常に（異常終了せずに）終了します。

## `recover` の使い所と注意点

*   **ライブラリ作成者:** 外部に提供するライブラリが内部で予期せず `panic` を起こした場合でも、ライブラリ利用側のプログラム全体をクラッシュさせないように、公開する関数のエントリーポイントで `recover` を使うことがあります。捕捉した `panic` は通常、`error` として利用者に返します。
*   **Goroutine の保護:** 特定の Goroutine が `panic` しても、他の Goroutine やプログラム全体が停止しないように、Goroutine の開始関数で `defer` と `recover` を使うことがあります。
*   **乱用は避ける:** `panic`/`recover` は、例外処理（他の言語の `try-catch` のようなもの）として**常用するべきではありません**。Goでは、予期されるエラーは `error` 型で処理するのが基本です。`panic`/`recover` は、あくまで回復不能なエラーや予期せぬ事態からの回復という限定的な目的で使うべきです。

`recover` は `panic` の影響を制御するための強力なツールですが、その使用は慎重に行う必要があります。