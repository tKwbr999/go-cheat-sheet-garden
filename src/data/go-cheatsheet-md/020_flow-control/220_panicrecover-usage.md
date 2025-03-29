## タイトル
title: `panic` と `recover` の適切な使い方

## タグ
tags: ["flow-control", "panic", "recover", "error", "エラー処理", "ベストプラクティス"]

## コード
```go
package main

import "fmt"

// panic を起こす可能性があり、内部で recover する関数
func SafeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic を回復: %v", r)
		}
	}()
	result = a / b // b が 0 だと panic する
	return result, nil
}

func main() {
	fmt.Println("--- 正常な除算 ---")
	res1, err1 := SafeDivide(10, 2)
	if err1 != nil { fmt.Println("エラー:", err1) } else { fmt.Printf("結果: %d\n", res1) }

	fmt.Println("\n--- ゼロ除算 (panic -> error) ---")
	res2, err2 := SafeDivide(10, 0) // panic するが recover される
	if err2 != nil {
		fmt.Println("エラー:", err2) // recover で設定された error
	} else {
		fmt.Printf("結果: %d\n", res2)
	}
	fmt.Println("\nプログラムは正常終了")
}

```

## 解説
```text
`panic` と `recover` はGoの機能ですが、使い方に注意が必要です。
Goのエラー処理の基本は **`error` 型の値を返す**ことです。
`panic`/`recover` を通常の制御フローやエラー処理の
代わりとして使うべきではありません。

**`panic` vs `error`: 使い分け原則**
*   **`error` (ほとんどの場合):**
    *   予期される範囲内の失敗 (ファイル無し、入力無効など)。
    *   呼び出し元が対処可能な場合。
    *   標準ライブラリや多くのライブラリはこの方式。
*   **`panic` (限定的な状況):**
    *   本当に予期しない、回復不能なエラー
        (必須設定無し、内部不整合、プログラムのバグ)。
    *   通常、Goroutine やプログラム全体が停止する深刻な事態。
    *   **原則、ライブラリ関数は `panic` すべきでない。**

**`recover` の適切な使い方:**
`panic` の影響を限定するために使いますが、乱用は避けます。
*   **ライブラリ境界:** 内部 panic が利用側をクラッシュさせないよう、
    公開関数の入口で `recover` し、`error` として返す。
*   **Goroutine 保護:** 特定 Goroutine の panic が全体に影響しないように。
*   **サーバー:** リクエスト処理中の panic でサーバー全体が
    停止しないように。

**`recover` を例外処理のように使うのは避けましょう。**

コード例の `SafeDivide` は、内部で発生する可能性のある
ゼロ除算 `panic` を `defer` と `recover` で捕捉し、
それを `error` 型の値として呼び出し元に返す良い例です。
これにより、呼び出し元は `panic` を意識せず、
通常の `error` として処理でき、プログラムの異常終了も防げます。

**まとめ:** Goのエラー処理の基本は `error`。
`panic`/`recover` は最後の手段として慎重に使いましょう。