---
title: "データ構造: マップ (Map) の基本操作"
tags: ["data-structures", "マップ", "map", "追加", "更新", "取得", "削除", "delete", "カンマOK"]
---

マップを作成（初期化）したら、キーを使って値を追加、更新、取得、削除といった操作を行うことができます。

## 1. 要素の追加と更新: `マップ名[キー] = 値`

マップに対して `マップ名[キー] = 値` という構文を使うと、以下の動作になります。

*   もし指定した `キー` がマップ内に**存在しなければ**、新しいキーと値のペアがマップに**追加**されます。
*   もし指定した `キー` がマップ内に**既に存在すれば**、そのキーに対応する値が新しい `値` に**更新**されます。

**注意:** この操作は `nil` マップに対して行うとパニックが発生します。必ず `make` やリテラルで初期化されたマップに対して行ってください。

## 2. 要素の取得: `変数 := マップ名[キー]`

`マップ名[キー]` という構文で、指定した `キー` に対応する値を取得できます。

*   もし指定した `キー` がマップ内に**存在すれば**、そのキーに対応する値が返されます。
*   もし指定した `キー` がマップ内に**存在しなければ**、値の型の**ゼロ値**（`int` なら `0`, `string` なら `""`, `bool` なら `false` など）が返されます。**エラーにはなりません**。

キーが存在しない場合にゼロ値が返るという仕様は便利なこともありますが、実際にキーが存在してその値がゼロ値なのか、それともキー自体が存在しないのかを区別したい場合があります。そのための方法は後述します（カンマOKイディオム）。

## 3. 要素の削除: `delete(マップ名, キー)`

組み込み関数の `delete()` を使うと、マップから指定したキーとその値のペアを削除できます。

**構文:** `delete(マップ名, キー)`

*   指定した `キー` がマップ内に存在すれば、そのキーと値のペアが削除されます。
*   指定した `キー` がマップ内に**存在しなくても**、`delete` 関数は**エラーを起こしません**（何も起こらないだけです）。
*   `nil` マップに対して `delete` を呼び出してもエラーにはなりません。

## コード例

```go title="マップの基本操作"
package main

import "fmt"

func main() {
	// make でマップを初期化
	scores := make(map[string]int)
	fmt.Println("初期状態:", scores)

	// --- 1. 要素の追加 ---
	scores["Alice"] = 95
	scores["Bob"] = 88
	fmt.Println("追加後:", scores)

	// --- 2. 要素の更新 ---
	scores["Alice"] = 98 // 既存のキー "Alice" の値を更新
	fmt.Println("更新後:", scores)

	// --- 3. 要素の取得 ---
	aliceScore := scores["Alice"]
	fmt.Printf("Alice の点数: %d\n", aliceScore)

	// 存在しないキーを取得しようとすると、値の型のゼロ値が返る
	charlieScore := scores["Charlie"] // "Charlie" は存在しない
	fmt.Printf("Charlie の点数: %d (ゼロ値)\n", charlieScore)

	// --- 4. キーの存在確認 (カンマOKイディオム) ---
	// マップアクセスは、値と「キーが存在したかどうか」の bool 値の2つを返すことができる
	value, ok := scores["Bob"]
	if ok {
		fmt.Printf("Bob は存在します。点数: %d\n", value)
	} else {
		fmt.Println("Bob は存在しません。")
	}

	value, ok = scores["David"] // "David" は存在しない
	if ok {
		fmt.Printf("David は存在します。点数: %d\n", value)
	} else {
		// ok が false になる。value にはゼロ値 (0) が入る。
		fmt.Printf("David は存在しません。(ok=%t, value=%d)\n", ok, value)
	}
	// この「カンマOKイディオム」を使うことで、キーの存在と値がゼロ値であることを区別できる

	// --- 5. 要素の削除 ---
	fmt.Println("\n削除前のマップ:", scores)
	delete(scores, "Bob") // キー "Bob" を削除
	fmt.Println("Bob 削除後:", scores)

	// 存在しないキーを削除してもエラーにはならない
	delete(scores, "David")
	fmt.Println("存在しない David 削除後:", scores)

	// --- マップの長さ ---
	fmt.Printf("現在の要素数 (len): %d\n", len(scores))
}

/* 実行結果:
初期状態: map[]
追加後: map[Alice:95 Bob:88]
更新後: map[Alice:98 Bob:88]
Alice の点数: 98
Charlie の点数: 0 (ゼロ値)
Bob は存在します。点数: 88
David は存在しません。(ok=false, value=0)

削除前のマップ: map[Alice:98 Bob:88]
Bob 削除後: map[Alice:98]
存在しない David 削除後: map[Alice:98]
現在の要素数 (len): 1
*/
```

**コード解説:**

*   `scores["Alice"] = 95`: キー `"Alice"` で値 `95` を追加（または更新）。
*   `aliceScore := scores["Alice"]`: キー `"Alice"` に対応する値を取得。
*   `charlieScore := scores["Charlie"]`: 存在しないキー `"Charlie"` を取得しようとすると、`int` のゼロ値である `0` が返されます。
*   **カンマOKイディオム:** `value, ok := scores["Bob"]` のように、マップアクセスを2つの変数で受け取ると、2番目の変数 `ok` にキーが存在したかどうかを示す `bool` 値が入ります。存在すれば `true`、しなければ `false` です。これにより、キーが存在しないことと、キーが存在して値がゼロ値であることを明確に区別できます。
*   `delete(scores, "Bob")`: マップ `scores` からキー `"Bob"` とそれに対応する値を削除します。

これらの基本操作を組み合わせることで、マップを効果的に利用することができます。