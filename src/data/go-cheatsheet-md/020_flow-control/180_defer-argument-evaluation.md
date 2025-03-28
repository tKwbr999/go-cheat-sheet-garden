---
title: "制御構文: `defer` される関数の引数評価タイミング"
tags: ["flow-control", "defer", "引数評価", "関数"]
---

`defer` 文は関数呼び出しの実行を遅延させますが、その関数に渡される**引数**はいつ評価されるのでしょうか？ これは `defer` を使う上で非常に重要なポイントです。

**ルール:** `defer` される関数呼び出しの**引数**は、`defer` 文が実行された**その時点**で評価され、その値が記憶されます。関数自体の実行は遅延されますが、引数の値は即座に決まります。

## 引数評価のタイミングを示す例

```go title="defer の引数評価タイミング"
package main

import "fmt"

func printValue(prefix string, value int) {
	fmt.Printf("%s: %d\n", prefix, value)
}

func main() {
	i := 0
	fmt.Printf("初期値 i = %d\n", i) // 0

	// defer 文を実行する時点で i の値 (0) が評価され、printValue の引数として記憶される
	defer printValue("defer 1", i) // ★ printValue("defer 1", 0) が予約される

	i++ // i をインクリメント (i は 1 になる)
	fmt.Printf("i++ 後 i = %d\n", i) // 1

	// この defer 文を実行する時点で i の値 (1) が評価される
	defer printValue("defer 2", i) // ★ printValue("defer 2", 1) が予約される

	i++ // i をさらにインクリメント (i は 2 になる)
	fmt.Printf("さらに i++ 後 i = %d\n", i) // 2

	fmt.Println("main 関数終了直前")
	// main 関数が終了する直前に、defer された関数が LIFO 順で実行される
	// 1. printValue("defer 2", 1) が実行される
	// 2. printValue("defer 1", 0) が実行される
}

/* 実行結果:
初期値 i = 0
i++ 後 i = 1
さらに i++ 後 i = 2
main 関数終了直前
defer 2: 1
defer 1: 0
*/
```

**コード解説:**

1.  `i` は `0` で初期化されます。
2.  最初の `defer printValue("defer 1", i)` が実行されます。この**瞬間**に引数 `i` の値 `0` が評価され、`printValue("defer 1", 0)` という呼び出しが後で実行されるように予約されます。
3.  `i` が `1` にインクリメントされます。
4.  次の `defer printValue("defer 2", i)` が実行されます。この**瞬間**に引数 `i` の値 `1` が評価され、`printValue("defer 2", 1)` という呼び出しが予約されます。
5.  `i` が `2` にインクリメントされます。
6.  `main` 関数が終了する直前になります。
7.  `defer` された関数が LIFO 順で実行されます。
    *   最後に `defer` された `printValue("defer 2", 1)` が実行され、「defer 2: 1」が出力されます。
    *   最初に `defer` された `printValue("defer 1", 0)` が実行され、「defer 1: 0」が出力されます。

**ポイント:**

`defer` された関数が実際に実行されるのは関数の最後ですが、その関数に渡される引数の値は `defer` 文が書かれた場所で**確定**します。後で変数の値が変わっても、`defer` された関数呼び出しに影響はありません。

## ポインタ引数の場合 (注意)

ただし、`defer` される関数にポインタを渡した場合、ポインタが指す先の**値**は関数実行時までに変更されている可能性があります。

```go title="defer にポインタを渡す場合"
package main

import "fmt"

func printPointerValue(prefix string, ptr *int) {
	// 関数実行時のポインタが指す先の値を表示
	fmt.Printf("%s: %d\n", prefix, *ptr)
}

func main() {
	i := 0
	fmt.Printf("初期値 i = %d\n", i)

	// i のポインタ (&i) を defer される関数に渡す
	// ポインタ &i 自体は defer 時に評価されるが、
	// printPointerValue が実行されるのは main 終了直前
	defer printPointerValue("defer (pointer)", &i) // ★ &i が引数

	i = 10 // main 終了前に i の値を変更
	fmt.Printf("変更後 i = %d\n", i)

	fmt.Println("main 関数終了直前")
	// defer された printPointerValue が実行される時、
	// ポインタ &i が指す先の値は 10 になっている
}

/* 実行結果:
初期値 i = 0
変更後 i = 10
main 関数終了直前
defer (pointer): 10
*/
```

この挙動は `defer` を使う上で混乱しやすい点の一つなので、引数がいつ評価されるのかを正確に理解しておくことが重要です。