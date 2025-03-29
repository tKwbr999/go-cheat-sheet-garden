## タイトル
title: 関数: 複数の戻り値

## タグ
tags: ["functions", "func", "戻り値", "return", "エラー処理", "_"]

## コード
```go
package main

import (
	"errors"
	"fmt"
)

// 商 (int) と 余り (int) と エラー (error) の3つを返す
func divideAndRemainder(a, b int) (int, int, error) {
	if b == 0 {
		return 0, 0, errors.New("ゼロ除算エラー") // エラー時
	}
	quotient := a / b
	remainder := a % b
	return quotient, remainder, nil // 成功時 (エラーは nil)
}

func main() {
	// 戻り値を複数の変数で受け取る
	q1, r1, err1 := divideAndRemainder(10, 3)
	if err1 != nil { fmt.Println("エラー:", err1) } else { fmt.Printf("10/3: 商%d, 余り%d\n", q1, r1) }

	// 一部の戻り値を _ で無視 (余りを無視)
	q2, _, err2 := divideAndRemainder(14, 5)
	if err2 != nil { fmt.Println("エラー:", err2) } else { fmt.Printf("14/5: 商%d\n", q2) }

	// エラーのみチェック
	_, _, err3 := divideAndRemainder(5, 0)
	if err3 != nil { fmt.Println("エラー:", err3) }
}

```

## 解説
```text
Goの関数は**複数の値を返す**ことができます。
これはGoの特徴的で便利な機能です。

**宣言方法:**
戻り値の型指定部分を `()` で囲み、
返す値の型をカンマ `,` で区切って列挙します。
`func 関数名(...) (戻り値1の型, 戻り値2の型, ...)`

**返し方:**
`return` 文で、宣言した型と順序に合わせて
値をカンマ区切りで返します。
`return 値1, 値2, ...`

**受け取り方:**
関数呼び出しの左辺で、複数の変数をカンマ区切りで
記述し、それぞれの戻り値を代入します。
`var1, var2, ... := 関数名(...)`

**戻り値の無視:**
不要な戻り値はブランク識別子 `_` で無視できます。
`q, _, err := divideAndRemainder(...)`

**エラー処理での活用:**
Goでは、処理結果とエラー情報を一緒に返すために
複数の戻り値が非常によく使われます。
最後の戻り値を `error` 型にするのが一般的です。
```go
result, err := someFunction()
if err != nil {
    // エラー処理
} else {
    // 成功時の処理 (result を使う)
}
```
これにより、関数の結果と状態（特にエラー状態）を
明確に伝えることができます。