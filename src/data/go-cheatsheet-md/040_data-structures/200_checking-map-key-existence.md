---
title: "データ構造: マップ (Map) のキー存在確認 (カンマOKイディオム)"
tags: ["data-structures", "マップ", "map", "キー存在確認", "カンマOK", "if"]
---

マップから値を取得する際 (`value := m[key]`)、もしキーが存在しなければ値の型のゼロ値が返されます。しかし、これだけでは「キーが存在しなかった」のか、「キーは存在するが、その値がたまたまゼロ値だった」のかを区別できません。

例えば、`map[string]int` でキー `"count"` の値を取得した際に `0` が返ってきた場合、それは `"count"` というキーが存在しないのか、それとも `"count"` キーの値が実際に `0` なのか判断できません。

この問題を解決するために、Goにはマップアクセス時にキーの存在有無も同時に確認できる**カンマOKイディオム (comma ok idiom)** が用意されています。

## カンマOKイディオム: `value, ok := マップ名[キー]`

マップの要素にアクセスする際、代入の左辺に2つの変数を書くと、2番目の変数にキーが存在したかどうかを示す `bool` 値が代入されます。

**構文:** `値変数, 存在フラグ変数 := マップ名[キー]`

*   `値変数`: キーに対応する値、またはキーが存在しない場合は値の型のゼロ値が代入されます。
*   `存在フラグ変数` (慣習的に `ok` という名前が使われることが多い):
    *   キーがマップ内に**存在すれば `true`** が代入されます。
    *   キーがマップ内に**存在しなければ `false`** が代入されます。

この `ok` 変数をチェックすることで、キーの存在を確実に判定できます。

## コード例

```go title="カンマOKイディオムによるキー存在確認"
package main

import "fmt"

func main() {
	// 点数を格納するマップ
	scores := map[string]int{
		"Alice": 95,
		"Bob":   0, // Bob の点数は 0 点
		// "Charlie" は存在しない
	}

	// --- キー "Alice" の存在確認 ---
	scoreAlice, okAlice := scores["Alice"]
	if okAlice {
		fmt.Printf("Alice は存在します。点数: %d\n", scoreAlice)
	} else {
		fmt.Println("Alice は存在しません。")
	}

	// --- キー "Bob" の存在確認 ---
	// Bob は存在するが、値は 0 (int のゼロ値)
	scoreBob, okBob := scores["Bob"]
	if okBob {
		fmt.Printf("Bob は存在します。点数: %d\n", scoreBob)
	} else {
		fmt.Println("Bob は存在しません。")
	}

	// --- キー "Charlie" の存在確認 ---
	scoreCharlie, okCharlie := scores["Charlie"]
	if okCharlie {
		fmt.Printf("Charlie は存在します。点数: %d\n", scoreCharlie)
	} else {
		// okCharlie は false になる
		fmt.Printf("Charlie は存在しません。(取得された値: %d)\n", scoreCharlie) // scoreCharlie にはゼロ値 0 が入る
	}

	// --- if 文の初期化ステートメントと組み合わせる (一般的) ---
	// マップアクセスと存在チェックを if 文の中で行う
	fmt.Println("\n--- if 文との組み合わせ ---")
	if score, ok := scores["Alice"]; ok {
		// このブロックは ok が true の場合のみ実行される
		// score 変数もこの if ブロック内でのみ有効
		fmt.Printf("Alice の点数は %d です。\n", score)
	} else {
		fmt.Println("Alice のデータはありません。")
	}

	if score, ok := scores["David"]; ok {
		fmt.Printf("David の点数は %d です。\n", score)
	} else {
		// ok が false なのでこちらが実行される
		// score 変数はゼロ値 (0) を持つが、通常このブロックでは使わない
		fmt.Println("David のデータはありません。")
	}
}

/* 実行結果:
Alice は存在します。点数: 95
Bob は存在します。点数: 0
Charlie は存在しません。(取得された値: 0)

--- if 文との組み合わせ ---
Alice の点数は 95 です。
David のデータはありません。
*/
```

**コード解説:**

*   `scoreAlice, okAlice := scores["Alice"]`: キー `"Alice"` は存在するので、`scoreAlice` に `95`、`okAlice` に `true` が代入されます。
*   `scoreBob, okBob := scores["Bob"]`: キー `"Bob"` は存在し、値は `0` なので、`scoreBob` に `0`、`okBob` に `true` が代入されます。
*   `scoreCharlie, okCharlie := scores["Charlie"]`: キー `"Charlie"` は存在しないので、`scoreCharlie` に `int` のゼロ値 `0`、`okCharlie` に `false` が代入されます。
*   `if score, ok := scores["Alice"]; ok { ... }`: `if` 文の初期化ステートメントでマップアクセスと存在チェックを同時に行い、`ok` が `true` の場合のみ `if` ブロックを実行する、という書き方は非常に一般的です。`score` と `ok` のスコープはこの `if` 文内に限定されます。

カンマOKイディオムは、マップのキーが存在するかどうかを安全かつ明確に確認するための必須のテクニックです。