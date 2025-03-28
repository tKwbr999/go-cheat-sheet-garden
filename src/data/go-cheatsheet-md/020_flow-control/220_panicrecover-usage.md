---
title: "制御構文: `panic` と `recover` の適切な使い方"
tags: ["flow-control", "panic", "recover", "error", "エラー処理", "ベストプラクティス"]
---

`panic` と `recover` はGo言語の機能の一部ですが、その使い方には注意が必要です。Goにおけるエラー処理の基本は、あくまで **`error` 型の値を返す**ことです。`panic` と `recover` は、通常の制御フローやエラー処理の代わりとして使うべきではありません。

## `panic` vs `error`: 使い分けの原則

*   **`error` を使うべき場合 (ほとんどの場合):**
    *   関数が失敗する可能性があるが、それは**予期される**範囲内である場合。
        *   例: ファイルが見つからない (`os.Open`)、ネットワーク接続ができない、ユーザー入力が無効である (`strconv.Atoi`)、リクエストされたデータが存在しない。
    *   呼び出し元がエラーに対処し、処理を継続したり、代替処理を行ったり、あるいはエラーをさらに上位に伝えたりすることが**可能**な場合。
    *   Goの標準ライブラリや多くのサードパーティライブラリは、予期される失敗に対して `error` を返します。

*   **`panic` を使うことを検討する場合 (限定的な状況):**
    *   **本当に予期しない、回復不能なエラー**が発生した場合。
        *   例: プログラムの動作に必須な初期設定が読み込めない、内部的な不整合が発生して処理の継続が不可能になった、配列の範囲外アクセスや `nil` ポインタ参照などの**プログラムのバグ**（これらは通常ランタイムが `panic` を引き起こす）。
    *   `panic` が発生すると、通常はその Goroutine (そして多くの場合プログラム全体) が停止します。これは、そのエラーが非常に深刻で、安全に処理を継続できないことを示唆します。

**原則として、ライブラリ関数が `panic` を引き起こすべきではありません。** ライブラリ利用者が対処できるように、エラーは `error` 型で返すのがGoの慣習です。

## `recover` の適切な使い方

`recover` は `panic` の影響を限定するために使われますが、これも乱用すべきではありません。

*   **ライブラリの境界:** 外部に提供するライブラリが、内部で（意図せず）`panic` を起こす可能性がある場合に、その `panic` がライブラリ利用側のプログラム全体をクラッシュさせないように、公開関数の最上位で `recover` を使うことがあります。捕捉した `panic` は通常、`error` 型の値に変換して呼び出し元に返します。
*   **Goroutine の保護:** 特定の Goroutine が `panic` しても、他の Goroutine やプログラム全体が停止しないように、Goroutine の開始関数 (`go func() { ... }`) の中で `defer` と `recover` を使うことがあります。
*   **サーバープログラム:** HTTPサーバーなどで、特定のリクエスト処理中に `panic` が発生してもサーバー全体が停止しないように、リクエストハンドラごとに `recover` を仕込むことがあります。

**`recover` を例外処理のように使うのは避けましょう。** Goでは `error` 型による明示的なエラーハンドリングが推奨されます。

## コード例: `panic` を `error` に変換する

前のセクションで見た `SafeDivide` 関数は、`recover` を使ってゼロ除算による `panic` を捕捉し、それを `error` 型として呼び出し元に返す良い例です。

```go title="SafeDivide 関数の利用"
package main

import (
	"fmt"
)

// panic を起こす可能性がある関数 (内部で recover する)
func SafeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic を回復しました: %v", r)
		}
	}()

	// b が 0 の場合、ここで panic するが、defer 内の recover で捕捉される
	result = a / b
	return result, nil // panic しなければ err は nil
}

func main() {
	fmt.Println("--- 正常な除算 ---")
	res1, err1 := SafeDivide(10, 2)
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Printf("結果: %d\n", res1)
	}

	fmt.Println("\n--- ゼロ除算 (panic が error に変換される) ---")
	res2, err2 := SafeDivide(10, 0) // ここで panic が発生するが...
	if err2 != nil {
		// recover によって返されたエラーを処理できる
		fmt.Println("エラー:", err2)
	} else {
		fmt.Printf("結果: %d\n", res2) // ここは実行されない
	}

	fmt.Println("\nプログラムは正常に終了します。")
}

/* 実行結果:
--- 正常な除算 ---
結果: 5

--- ゼロ除算 (panic が error に変換される) ---
エラー: panic を回復しました: runtime error: integer divide by zero

プログラムは正常に終了します。
*/
```

この例のように、`recover` は `panic` を通常の `error` フローに戻すために使うことができますが、これは主にライブラリの境界や Goroutine の保護といった特定の文脈で有効なテクニックです。

**まとめ:**

Goのエラー処理の基本は `error` 型です。`panic` と `recover` は、回復不能なエラーや予期せぬ事態に対処するための最後の手段として、慎重に使いましょう。