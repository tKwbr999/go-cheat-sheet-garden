## タイトル
title: 複数の `defer` と実行順序 (LIFO)

## タグ
tags: ["flow-control", "defer", "LIFO", "スタック", "関数"]

## コード
```go
package main

import "fmt"

func main() {
	fmt.Println("main: 開始")

	defer fmt.Println("defer 1 (最後に実行)") // 1番目に defer
	defer fmt.Println("defer 2")             // 2番目に defer
	defer fmt.Println("defer 3 (最初に実行)") // 3番目に defer

	fmt.Println("main: 終了前")
	// main 関数終了直前に defer 3 -> defer 2 -> defer 1 の順で実行
}

```

## 解説
```text
一つの関数内で複数の `defer` 文を使うことができます。
この場合、`defer` で予約された関数呼び出しは、
**LIFO (Last-In, First-Out)** の順序で実行されます。
つまり、**最後に `defer` されたものが最初に実行**され、
最初に `defer` されたものが最後に実行されます
(スタックのように動作します)。

**なぜ LIFO なのか？**
リソースの確保と解放のペアを自然に対応させるのに役立ちます。
リソースAを確保 (`defer releaseA`) し、次にリソースBを確保
(`defer releaseB`) した場合、関数終了時には `releaseB` が
先に呼ばれ、次に `releaseA` が呼ばれるという、
自然な解放順序になります。

**コード例:**
`main` 関数内で3つの `defer fmt.Println` が登録されています。
関数が終了する直前に、最後に登録された `defer 3` が最初に実行され、
次に `defer 2`、最後に最初に登録された `defer 1` が実行されます。
出力結果が `defer 3` -> `defer 2` -> `defer 1` の順になることで
LIFOを確認できます。

複数の `defer` を使う場合は、この LIFO の実行順序を
理解しておくことが重要です。