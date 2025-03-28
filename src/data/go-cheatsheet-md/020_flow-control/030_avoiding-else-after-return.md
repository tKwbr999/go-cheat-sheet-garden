---
title: "制御構文: `return` 後の `else` を避けるスタイル (早期リターン)"
tags: ["flow-control", "if", "else", "return", "エラー処理", "コーディングスタイル", "早期リターン", "ガード節"]
---

Goのコード、特にエラー処理を伴う関数では、`if` ブロック内で処理を中断して関数から抜ける（`return` する）場合に、続く `else` ブロックを省略する書き方が推奨されています。これは**早期リターン (Early Return)** や**ガード節 (Guard Clause)** と呼ばれるスタイルです。

## なぜ `else` を避けるのか？

主な目的は、コードの**ネスト（字下げ）を浅く**し、**正常系の処理（主要なロジック）を読みやすく**することです。

エラー処理や事前条件チェックのような「異常系」や「前提条件」の処理を関数の早い段階で `if` と `return` で片付けてしまうことで、その後のコードは正常系の処理に集中できます。

## 書き方の比較

例として、入力された文字列が空でないかチェックし、空でなければ処理を行う関数を考えます。

**`else` を使う書き方:**

```go title="else を使う場合 (ネストが深くなる)"
package main

import (
	"errors"
	"fmt"
)

func processIfNotEmptyElse(input string) (string, error) {
	if input != "" { // 条件: input が空でない場合
		// 正常系の処理が if ブロックの中に入る
		processed := "処理結果: " + input
		fmt.Println("正常系の処理を実行中...")
		return processed, nil // 成功
	} else {
		// 異常系の処理 (エラー)
		return "", errors.New("入力が空です")
	}
	// この書き方だと、正常系のコードがインデントされる
}

func main() {
	res1, err1 := processIfNotEmptyElse("データあり")
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Println(res1)
	}

	res2, err2 := processIfNotEmptyElse("")
	if err2 != nil {
		fmt.Println("エラー:", err2)
	} else {
		fmt.Println(res2)
	}
}

/* 実行結果:
正常系の処理を実行中...
処理結果: データあり
エラー: 入力が空です
*/
```

**早期リターンを使う書き方 (推奨):**

```go title="早期リターンを使う場合 (ネストが浅い)"
package main

import (
	"errors"
	"fmt"
)

func processIfNotEmptyEarlyReturn(input string) (string, error) {
	// 先に異常系のチェックとリターンを行う (ガード節)
	if input == "" {
		return "", errors.New("入力が空です") // エラーなら即座に関数から抜ける
	}

	// ここから下は input が空でないことが保証されている
	// 正常系の処理がインデントされずに書ける
	processed := "処理結果: " + input
	fmt.Println("正常系の処理を実行中...")
	return processed, nil // 成功
}

func main() {
	res1, err1 := processIfNotEmptyEarlyReturn("データあり")
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Println(res1)
	}

	res2, err2 := processIfNotEmptyEarlyReturn("")
	if err2 != nil {
		fmt.Println("エラー:", err2)
	} else {
		fmt.Println(res2)
	}
}

/* 実行結果:
正常系の処理を実行中...
処理結果: データあり
エラー: 入力が空です
*/
```

**比較のポイント:**

*   早期リターンを使うと、エラー処理や前提条件チェックが関数の冒頭にまとまります。
*   正常系の主要なロジックが `if` のネストの外側に出てくるため、インデントが深くなりすぎず、コードの主目的が追いやすくなります。
*   特に、複数のエラーチェックや条件チェックが必要な場合、早期リターンのスタイルはコードの可読性を大幅に向上させます。

Goの標準ライブラリや多くのGoプロジェクトでこのスタイルが採用されています。エラーチェックの際には、`if err != nil { return err }` のように早期リターンを活用することを意識しましょう。