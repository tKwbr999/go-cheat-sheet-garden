## タイトル
title: `defer` される関数の引数評価タイミング

## タグ
tags: ["flow-control", "defer", "引数評価", "関数"]

## コード
```go
package main

import "fmt"

func printValue(prefix string, value int) {
	fmt.Printf("%s: %d\n", prefix, value)
}

func main() {
	i := 0
	fmt.Printf("初期値 i = %d\n", i)

	// defer 実行時に i の値 (0) が評価・記憶される
	defer printValue("defer 1", i)

	i++
	fmt.Printf("i++ 後 i = %d\n", i)

	// defer 実行時に i の値 (1) が評価・記憶される
	defer printValue("defer 2", i)

	i++
	fmt.Printf("さらに i++ 後 i = %d\n", i)

	fmt.Println("main 関数終了直前")
	// LIFO順で実行: defer 2 (引数1), defer 1 (引数0)
}

```

## 解説
```text
`defer` は関数呼び出しの実行を遅延させますが、
その関数に渡される**引数**はいつ評価されるのでしょうか？

**ルール:**
`defer` される関数呼び出しの**引数**は、
`defer` 文が実行された**その時点**で評価され、
その値が記憶されます。
関数自体の実行は遅延されますが、
引数の値は即座に決まります。

**コード例:**
1. 最初の `defer printValue("defer 1", i)` 実行時、
   `i` の値 `0` が評価され、
   `printValue("defer 1", 0)` が予約されます。
2. `i` が `1` になります。
3. 次の `defer printValue("defer 2", i)` 実行時、
   `i` の値 `1` が評価され、
   `printValue("defer 2", 1)` が予約されます。
4. `i` が `2` になります。
5. `main` 関数終了直前、LIFO順で実行されます。
   * `printValue("defer 2", 1)` が実行される (出力: `defer 2: 1`)。
   * `printValue("defer 1", 0)` が実行される (出力: `defer 1: 0`)。

`defer` 時点で引数の値は確定するため、
後で変数の値が変わっても影響しません。

**注意: ポインタ引数**
ただし、`defer` される関数にポインタを渡した場合
(例: `defer printPtr(&i)`)、
ポインタ変数自体 (`&i`) は `defer` 時に評価されますが、
関数実行時 (関数終了直前) には、そのポインタが
指す先の**最新の値**が参照されます。