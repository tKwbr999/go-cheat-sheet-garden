## タイトル
title: `return` 後の `else` を避けるスタイル (早期リターン)

## タグ
tags: ["flow-control", "if", "else", "return", "エラー処理", "コーディングスタイル", "早期リターン", "ガード節"]

## コード
```go
package main

import (
	"errors"
	"fmt"
)

func processIfNotEmptyEarlyReturn(input string) (string, error) {
	// 先に異常系のチェックとリターン (ガード節)
	if input == "" {
		return "", errors.New("入力が空です")
	}

	// ここから下は input が空でないことが保証される
	// 正常系の処理がインデントされずに書ける
	processed := "処理結果: " + input
	fmt.Println("正常系の処理を実行中...")
	return processed, nil
}

func main() {
	res1, err1 := processIfNotEmptyEarlyReturn("データあり")
	if err1 != nil { fmt.Println("エラー:", err1) } else { fmt.Println(res1) }

	res2, err2 := processIfNotEmptyEarlyReturn("")
	if err2 != nil { fmt.Println("エラー:", err2) } else { fmt.Println(res2) }
}
```

## 解説
```text
Goの関数、特にエラー処理では、`if` ブロック内で
処理を中断して `return` する場合に、続く `else` を
省略する書き方が推奨されます。
これは**早期リターン (Early Return)** や
**ガード節 (Guard Clause)** と呼ばれるスタイルです。

**なぜ `else` を避けるのか？**
*   コードの**ネスト（字下げ）を浅く**する。
*   **正常系の処理（主要なロジック）を読みやすく**する。

エラー処理や事前条件チェックのような「異常系」を
関数の早い段階で `if` と `return` で片付けることで、
その後のコードは正常系の処理に集中できます。

**書き方の比較:**
`else` を使うと、正常系の処理が `if` ブロックの中に
入ってしまい、ネストが深くなることがあります。

早期リターンを使うと、コード例のように
`if input == "" { return ... }` で異常系を先に処理し、
その後の行では `input` が空でないことが保証された状態で
正常系の処理をインデントなしで記述できます。

**利点:**
*   エラー処理や前提条件チェックが関数の冒頭にまとまる。
*   正常系のロジックがネストの外側に出て読みやすい。
*   複数のチェックが必要な場合に特に可読性が向上する。

Goの標準ライブラリや多くのプロジェクトで
このスタイルが採用されています。
エラーチェックでは `if err != nil { return err }` のように
早期リターンを活用しましょう。