---
title: "制御構文: 複数の `defer` と実行順序 (LIFO)"
tags: ["flow-control", "defer", "LIFO", "スタック", "関数"]
---

一つの関数内で複数の `defer` 文を使うことも可能です。この場合、`defer` で予約された関数呼び出しは、**LIFO (Last-In, First-Out)** の順序で実行されます。これは、最後に `defer` されたものが最初に実行され、最初に `defer` されたものが最後に実行される、という意味です。スタック（積み重ねた皿のようなデータ構造）に積んでいき、上から取り出すイメージです。

## LIFO (Last-In, First-Out) とは？

*   **Last-In (最後に入れたもの):** 関数内で最後に `defer` 文で指定された関数呼び出し。
*   **First-Out (最初に出されるもの):** 関数が終了する際に、最後に `defer` された関数呼び出しが**最初に**実行されます。

## なぜ LIFO なのか？

この LIFO の順序は、リソースの確保と解放のペアを自然に対応させるのに役立ちます。例えば、あるリソースAを確保し、次にそのリソースAを使ってリソースBを確保した場合、解放する際は通常、Bを先に解放し、次にAを解放する必要があります。`defer` を確保直後に記述すると、この解放順序が LIFO によって自然に実現されます。

```go
// 擬似コード
resourceA := acquireResourceA()
defer releaseResourceA(resourceA) // 最後に実行される

resourceB := acquireResourceB(resourceA)
defer releaseResourceB(resourceB) // 最初に実行される

// ... resourceA と resourceB を使った処理 ...

// 関数終了時、まず releaseResourceB が呼ばれ、次に releaseResourceA が呼ばれる
```

## コード例

```go title="複数の defer の実行順序 (LIFO)"
package main

import "fmt"

func trace(s string) string {
	fmt.Println("開始:", s)
	return s
}

func un(s string) {
	fmt.Println("終了:", s)
}

func a() {
	// trace("a") の呼び出しは defer の登録時ではなく、即座に行われる。
	// un(trace("a")) の呼び出しが defer される。
	defer un(trace("a")) // ★ 1番目に defer される (最後に実行)
	fmt.Println("関数 a の本体を実行中...")
}

func b() {
	defer un(trace("b")) // ★ 1番目に defer される (最後に実行)
	fmt.Println("関数 b の本体: 開始")
	defer un(trace("b-inner")) // ★ 2番目に defer される (最初に実行)
	fmt.Println("関数 b の本体: 終了")
}

func main() {
	fmt.Println("--- 関数 a の呼び出し ---")
	a()

	fmt.Println("\n--- 関数 b の呼び出し ---")
	b()

	fmt.Println("\n--- main 関数内の複数の defer ---")
	fmt.Println("main: 開始")
	defer fmt.Println("main: defer 1 (最後に実行)") // ★ 1番目
	defer fmt.Println("main: defer 2")             // ★ 2番目
	defer fmt.Println("main: defer 3 (最初に実行)") // ★ 3番目
	fmt.Println("main: 終了前")
	// main 関数が終了する直前に、defer 3 -> defer 2 -> defer 1 の順で実行される
}

/* 実行結果:
--- 関数 a の呼び出し ---
開始: a
関数 a の本体を実行中...
終了: a

--- 関数 b の呼び出し ---
開始: b
関数 b の本体: 開始
開始: b-inner
関数 b の本体: 終了
終了: b-inner
終了: b

--- main 関数内の複数の defer ---
main: 開始
main: 終了前
main: defer 3 (最初に実行)
main: defer 2
main: defer 1 (最後に実行)
*/
```

**コード解説:**

*   `trace` 関数と `un` 関数は、処理の開始と終了を分かりやすく表示するためのヘルパー関数です。`defer un(trace("a"))` のように書くと、`trace("a")` は `defer` 文が評価されるタイミング（`a` 関数の開始時）で実行され、その戻り値 `"a"` が `un` 関数の引数として記憶されます。そして、`un("a")` の呼び出し自体が `defer` されます。
*   関数 `a` では、`defer un(trace("a"))` が登録され、関数 `a` が終了する直前に `un("a")` が実行されます。
*   関数 `b` では、まず `defer un(trace("b"))` が登録され、次に `defer un(trace("b-inner"))` が登録されます。関数 `b` が終了する直前に、**最後に登録された** `un(trace("b-inner"))` がまず実行され、その次に**最初に登録された** `un(trace("b"))` が実行されます (LIFO)。
*   `main` 関数内でも同様に、`defer` された順序とは**逆**の順序（`defer 3` -> `defer 2` -> `defer 1`）で `fmt.Println` が実行されていることがわかります。

複数の `defer` 文を使う場合は、この LIFO の実行順序を理解しておくことが重要です。