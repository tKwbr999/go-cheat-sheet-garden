---
title: "制御構文: 条件分岐 `if`, `else if`, `else`"
tags: ["flow-control", "if", "else if", "else", "条件分岐"]
---

プログラムは通常、上から下へと順番に実行されますが、特定の**条件**に応じて実行する処理を変えたい場合があります。このような「もし〜ならば、Aを実行し、そうでなければBを実行する」といった制御を行うのが**条件分岐**です。

Go言語で最も基本的な条件分岐を行うのが `if` 文です。

## `if` 文の基本構文

`if` 文は、指定された条件式を評価し、その結果が `true` であれば、それに続く `{}` ブロック内のコードを実行します。

```go title="基本的な if 文"
package main

import "fmt"

func main() {
	score := 85

	// score が 60 以上かどうかを評価
	if score >= 60 {
		// 条件が true の場合に実行される
		fmt.Println("合格です！")
	}

	fmt.Println("処理を終了します。")
}

/* 実行結果:
合格です！
処理を終了します。
*/
```

**コード解説:**

*   `if 条件式 { ... }`: これが `if` 文の基本形です。
*   `条件式`: 評価結果が `bool` 型 (`true` または `false`) になる式を記述します。比較演算子 (`>=`, `==`, `<` など) や論理演算子 (`&&`, `||`, `!`) を使った式、あるいは `bool` 型の変数そのものを指定できます。
*   **Goの特徴:**
    *   条件式を囲む丸括弧 `()` は**不要**です（他の言語では必要な場合が多い）。
    *   処理ブロックを囲む中括弧 `{}` は**必須**です（たとえ処理が一行でも省略できません）。
    *   `if` と `{` は同じ行に書く必要があります。

## `else`: 条件が偽の場合の処理

`if` の条件が `false` だった場合に実行したい処理がある場合は、`else` を使います。

```go title="if-else 文"
package main

import "fmt"

func main() {
	age := 18

	if age >= 20 {
		fmt.Println("成人です。")
	} else {
		// age >= 20 が false の場合に実行される
		fmt.Println("未成年です。")
	}
}

/* 実行結果:
未成年です。
*/
```

**コード解説:**

*   `else { ... }`: `if` の条件式が `false` の場合に、`else` ブロック内のコードが実行されます。
*   `else` は `if` ブロックの閉じ括弧 `}` と同じ行に書く必要があります。

## `else if`: 複数の条件を順番に評価

複数の条件を順番に評価し、最初に `true` になった条件のブロックを実行したい場合は、`else if` を使います。

```go title="if-else if-else 文"
package main

import "fmt"

func main() {
	temperature := 25

	if temperature >= 30 {
		fmt.Println("暑いですね！")
	} else if temperature >= 15 { // 上の if が false で、かつ temperature >= 15 が true の場合
		fmt.Println("過ごしやすい気温です。")
	} else if temperature >= 0 { // 上の if, else if が false で、かつ temperature >= 0 が true の場合
		fmt.Println("少し肌寒いですね。")
	} else { // 上のすべての条件が false の場合
		fmt.Println("とても寒いです！")
	}
}

/* 実行結果:
過ごしやすい気温です。
*/
```

**コード解説:**

*   `else if 条件式 { ... }`: `if` や先行する `else if` の条件がすべて `false` で、かつこの `else if` の条件式が `true` の場合に実行されます。
*   `else if` はいくつでも繋げることができます。
*   最後の `else` は、それまでの `if`, `else if` のどの条件にも当てはまらなかった場合に実行されます（省略可能です）。
*   条件は上から順番に評価され、最初に `true` になったブロックだけが実行され、残りの `else if` や `else` は評価されません。

`if`, `else if`, `else` を組み合わせることで、様々な状況に応じた処理の流れを作ることができます。