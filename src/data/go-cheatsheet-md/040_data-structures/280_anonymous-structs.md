---
title: "データ構造: 匿名構造体 (Anonymous Struct)"
tags: ["data-structures", "構造体", "struct", "匿名構造体", "リテラル"]
---

通常、構造体は `type` キーワードを使って名前を付けて定義しますが、Go言語では**名前を付けずに**その場で構造体を定義して使うこともできます。これを**匿名構造体 (Anonymous Struct)** と呼びます。

## 匿名構造体の構文

匿名構造体は、構造体リテラルの中で `struct { ... }` を使って直接定義します。

**構文:**
```go
変数名 := struct {
	フィールド名1 型1
	フィールド名2 型2
	// ...
}{ // 構造体定義の直後に初期化リテラルを続ける
	フィールド名1: 値1,
	フィールド名2: 値2,
	// ...
}
```

*   `struct { ... }`: `type` キーワードを使わずに、その場で構造体のフィールドを定義します。
*   `{ ... }`: 定義の直後に中括弧を続け、通常の構造体リテラルと同様にフィールドの初期値を指定します。フィールド名を指定する方法も、省略する方法（非推奨）も使えます。

## コード例

```go title="匿名構造体の定義と利用"
package main

import "fmt"

func main() {
	// --- 匿名構造体の作成と初期化 ---
	// その場で座標 (X, Y) を持つ構造体を定義し、初期化
	point := struct {
		X int
		Y int
	}{ // 定義の直後に初期化
		X: 10,
		Y: 20,
	}

	fmt.Printf("point: %+v (型: %T)\n", point, point)
	// 型名は struct { X int; Y int } のようになる

	// フィールドへのアクセスは通常の構造体と同じ
	fmt.Printf("point.X = %d\n", point.X)
	point.Y = 25
	fmt.Printf("変更後の point.Y = %d\n", point.Y)

	// --- 別の匿名構造体 ---
	// フィールド名を省略した初期化 (非推奨だが可能)
	person := struct {
		Name string
		Age  int
	}{"Alice", 30} // 順序に依存する

	fmt.Printf("\nperson: %+v (型: %T)\n", person, person)
	// 型名は struct { Name string; Age int }

	// --- 匿名構造体のスライス ---
	// 匿名構造体のスライスも作成できる
	users := []struct {
		ID   int
		Role string
	}{
		{1, "Admin"},
		{2, "Editor"},
		{3, "Viewer"},
	}

	fmt.Println("\n--- 匿名構造体のスライス ---")
	for _, user := range users {
		fmt.Printf("ID: %d, Role: %s\n", user.ID, user.Role)
	}
}

/* 実行結果:
point: {X:10 Y:20} (型: struct { X int; Y int })
point.X = 10
変更後の point.Y = 25

person: {Name:Alice Age:30} (型: struct { Name string; Age int })

--- 匿名構造体のスライス ---
ID: 1, Role: Admin
ID: 2, Role: Editor
ID: 3, Role: Viewer
*/
```

**コード解説:**

*   `point := struct { X int; Y int }{X: 10, Y: 20}`: `X` と `Y` という `int` 型のフィールドを持つ匿名構造体を定義し、同時にその値を初期化して変数 `point` に代入しています。`point` の型は `struct { X int; Y int }` という名前のない型になります。
*   `person := struct { Name string; Age int }{"Alice", 30}`: フィールド名を省略して初期化する例です（非推奨）。
*   `users := []struct { ... }{ ... }`: 匿名構造体のスライスを作成しています。スライスの要素の型が `struct { ID int; Role string }` となります。

## 匿名構造体の使い所

匿名構造体は、その場で一時的にデータをグループ化したい場合に便利です。

*   **テストデータ:** テストケースで使う一時的なデータ構造として。
*   **JSON/YAMLなどのエンコード/デコード:** 設定ファイルやAPIレスポンスなど、特定の形式のデータを一時的に扱う際に、わざわざ名前付きの型を定義せずに済む場合があります。
*   **テーブル駆動テスト:** テストの入力と期待する出力をまとめるために使われることがあります。

## 注意点

*   **再利用性の低さ:** 名前がないため、同じ構造を複数の場所で使いたい場合には不便です。そのような場合は `type` で名前付きの構造体を定義すべきです。
*   **型の同一性:** フィールドの構成が全く同じでも、異なる場所で定義された匿名構造体は、Goの型システム上では**異なる型**として扱われる場合があります。

匿名構造体は、特定の状況下でコードを簡潔にするのに役立ちますが、再利用性や型の明確さが重要な場合は、名前付きの構造体を使う方が適切です。