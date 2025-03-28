---
title: "関数: 複数の戻り値"
tags: ["functions", "func", "戻り値", "return", "エラー処理", "_"]
---

多くのプログラミング言語では、関数は通常一つの値しか返すことができません。しかし、Go言語の関数は**複数の値を返す**ことができます。これはGoの非常に特徴的で便利な機能の一つです。

## 複数の戻り値を持つ関数の宣言

関数が複数の値を返すようにするには、関数宣言の戻り値の型指定部分を丸括弧 `()` で囲み、返す値の型をカンマ `,` で区切って列挙します。

**構文:**
```go
func 関数名(引数リスト) (戻り値1の型, 戻り値2の型, ...) {
	// ... 関数の処理 ...
	return 値1, 値2, ... // return 文で複数の値をカンマ区切りで返す
}
```

## コード例: 商と余りを返す関数

例として、整数の除算を行い、その**商**と**余り**の両方を返す関数を考えてみましょう。

```go title="複数の戻り値を持つ関数の例"
package main

import (
	"errors" // エラー作成用
	"fmt"
)

// 2つの int 型の引数 a と b を受け取り、
// a を b で割った商 (int) と余り (int) の2つの値を返す関数
func divideAndRemainder(a, b int) (int, int, error) { // 戻り値の型を (int, int, error) と指定
	// ゼロ除算チェック
	if b == 0 {
		// エラーの場合は、意味のある値 (0, 0) とエラー情報を返す
		return 0, 0, errors.New("ゼロ除算エラー")
	}
	quotient := a / b // 商
	remainder := a % b // 余り
	// return 文で、定義した順序に合わせて値をカンマ区切りで返す
	return quotient, remainder, nil // 成功時はエラーなし (nil)
}

func main() {
	// --- 戻り値を複数の変数で受け取る ---
	q1, r1, err1 := divideAndRemainder(10, 3)
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		// q1 に商 (3)、r1 に余り (1) が代入される
		fmt.Printf("10 ÷ 3 = 商 %d, 余り %d\n", q1, r1)
	}

	// --- 一部の戻り値を無視する ---
	// 商だけが必要で、余りは不要な場合
	q2, _, err2 := divideAndRemainder(14, 5) // 余りを受け取る変数を _ で無視
	if err2 != nil {
		fmt.Println("エラー:", err2)
	} else {
		fmt.Printf("14 ÷ 5 = 商 %d (余りは無視)\n", q2)
	}

	// --- エラーが発生する場合 ---
	_, _, err3 := divideAndRemainder(5, 0) // ゼロ除算
	if err3 != nil {
		fmt.Println("エラー:", err3)
	} else {
		fmt.Println("ゼロ除算が成功？ (ありえない)")
	}
}

/* 実行結果:
10 ÷ 3 = 商 3, 余り 1
14 ÷ 5 = 商 2 (余りは無視)
エラー: ゼロ除算エラー
*/
```

**コード解説:**

*   `func divideAndRemainder(a, b int) (int, int, error)`: この関数は `int`, `int`, `error` の3つの値を返すことを宣言しています。
*   `return quotient, remainder, nil`: `return` 文で、宣言した戻り値の型と順序に合わせて、商 (`quotient`)、余り (`remainder`)、そしてエラーがないことを示す `nil` をカンマ区切りで返しています。
*   `q1, r1, err1 := divideAndRemainder(10, 3)`: 関数呼び出しの左辺で、複数の変数をカンマで区切って記述することで、それぞれの戻り値を対応する変数に一度に代入できます。
*   `q2, _, err2 := divideAndRemainder(14, 5)`: 戻り値の一部が不要な場合は、ブランク識別子 `_` を使って無視することができます。この例では、2番目の戻り値である余りを無視しています。

## エラー処理での活用

Goでは、処理の結果とエラー情報を一緒に返すために、複数の戻り値が非常によく使われます。関数の最後の戻り値を `error` 型にするのが一般的なパターンです。

```go
// 何らかの処理を行い、結果の文字列とエラーを返す関数の例
func process() (string, error) {
	// ... 処理 ...
	if success {
		return "処理結果", nil // 成功
	} else {
		return "", errors.New("処理に失敗しました") // 失敗
	}
}

// 呼び出し側
result, err := process()
if err != nil {
	// エラー処理
} else {
	// 成功時の処理 (result を使う)
}
```

複数の戻り値は、関数の結果と状態（特にエラー状態）を明確に伝えるための強力なメカニズムです。