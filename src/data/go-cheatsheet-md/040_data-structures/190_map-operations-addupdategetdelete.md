## タイトル
title: データ構造: マップ (Map) の基本操作

## タグ
tags: ["data-structures", "マップ", "map", "追加", "更新", "取得", "削除", "delete", "カンマOK"]

## コード
```go
package main

import "fmt"

func main() {
	scores := make(map[string]int)

	// 1. 要素の追加/更新: map[key] = value
	scores["Alice"] = 95 // 追加
	scores["Bob"] = 88   // 追加
	scores["Alice"] = 98 // 更新
	fmt.Println("追加/更新後:", scores)

	// 2. 要素の取得: value := map[key]
	aliceScore := scores["Alice"]
	fmt.Printf("Aliceの点数: %d\n", aliceScore)
	// charlieScore := scores["Charlie"] // 存在しないキー -> 0 (intのゼロ値)

	// 3. キーの存在確認 (カンマOKイディオム)
	value, ok := scores["Bob"] // ok に存在有無 (bool) が入る
	if ok {
		fmt.Printf("Bobは存在: %d\n", value)
	}
	value, ok = scores["David"]
	if !ok {
		fmt.Printf("Davidは不在 (ok=%t, value=%d)\n", ok, value)
	}

	// 4. 要素の削除: delete(map, key)
	delete(scores, "Bob")
	fmt.Println("Bob削除後:", scores)
	delete(scores, "David") // 存在しなくてもエラーにならない
	fmt.Println("David削除試行後:", scores)

	fmt.Printf("現在の要素数: %d\n", len(scores))
}

```

## 解説
```text
初期化されたマップに対して、キーを使って
値の追加、更新、取得、削除ができます。

**1. 要素の追加・更新: `マップ名[キー] = 値`**
*   キーが存在しなければ**追加**、存在すれば**更新**。
*   **注意:** `nil` マップへの書き込みは `panic`。

**2. 要素の取得: `変数 := マップ名[キー]`**
*   キーが存在すれば対応する値を返す。
*   キーが存在しなければ、**値の型のゼロ値**を返す
    (エラーにはならない)。

**3. キーの存在確認: カンマOKイディオム**
マップアクセスは2つの値を受け取れます。
`value, ok := マップ名[キー]`
*   `value`: キーに対応する値 (存在しない場合はゼロ値)。
*   `ok`: キーが存在したかどうか (`bool` 型)。
    存在すれば `true`、しなければ `false`。
これを使うと、キーが存在しないことと、
キーが存在して値がゼロ値であることを区別できます。

**4. 要素の削除: `delete(マップ名, キー)`**
組み込み関数 `delete()` でキーと値のペアを削除します。
*   指定したキーが存在しなくてもエラーにならない。
*   `nil` マップに対して呼び出してもエラーにならない。

`len(マップ名)` で現在の要素数を取得できます。