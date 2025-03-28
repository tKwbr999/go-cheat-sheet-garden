---
title: "データ構造: 構造体 (Struct) の値（インスタンス）の作成"
tags: ["data-structures", "構造体", "struct", "初期化", "リテラル", "new", "ポインタ"]
---

構造体型を定義したら、その型の**値（インスタンス）**を作成して、実際にデータを格納したり操作したりします。Goでは主に**構造体リテラル**を使って構造体の値を作成・初期化します。

## 構造体リテラルによる作成・初期化

構造体リテラルは、`型名{}` の形式で記述し、中括弧 `{}` の中にフィールドの初期値を指定します。

### 方法1: フィールド名を指定する (推奨)

`フィールド名: 値` の形式で、初期化したいフィールドとその値を指定します。

*   フィールドの**順序は任意**です。
*   一部のフィールドだけを初期化することも可能です。指定されなかったフィールドは**ゼロ値**で初期化されます。
*   **推奨される方法:** フィールド名が明記されるため、コードが読みやすく、構造体の定義が変更された場合（フィールドの順序変更や追加など）にも影響を受けにくいです。

```go title="フィールド名指定による構造体リテラル"
package main

import "fmt"

type Point struct {
	X, Y int
}

type Circle struct {
	Center Point // 構造体をフィールドとして持つ
	Radius int
	Label  string
}

func main() {
	// --- フィールド名を指定して初期化 ---
	p1 := Point{X: 10, Y: 20} // X と Y を初期化
	fmt.Printf("p1: %+v\n", p1)

	// 順序は任意
	p2 := Point{Y: 50, X: 30}
	fmt.Printf("p2: %+v\n", p2)

	// 一部のフィールドのみ初期化 (Y はゼロ値 0 になる)
	p3 := Point{X: 100}
	fmt.Printf("p3: %+v\n", p3)

	// ネストした構造体の初期化
	c1 := Circle{
		Center: Point{X: 5, Y: 5}, // ネストした構造体もリテラルで初期化
		Radius: 10,
		Label:  "My Circle", // 最後のフィールドの後にもカンマを付けるのが Go のスタイル
	}
	fmt.Printf("c1: %+v\n", c1)

	// Center フィールドだけ初期化 (Radius, Label はゼロ値)
	c2 := Circle{Center: Point{X: 1, Y: 1}}
	fmt.Printf("c2: %+v\n", c2)
}

/* 実行結果:
p1: {X:10 Y:20}
p2: {X:30 Y:50}
p3: {X:100 Y:0}
c1: {Center:{X:5 Y:5} Radius:10 Label:My Circle}
c2: {Center:{X:1 Y:1} Radius:0 Label:}
*/
```

### 方法2: フィールド名を省略する (非推奨)

フィールド名を省略し、構造体定義の**フィールドと同じ順序**で値を指定します。

*   **すべてのフィールド**の値を、定義と同じ順序で指定する必要があります。
*   **非推奨:** 構造体の定義でフィールドの順序が変わったり、フィールドが追加されたりすると、コードが**壊れやすく**なります。また、どの値がどのフィールドに対応するのか分かりにくく、可読性が低下します。特別な理由がない限り、フィールド名を指定する方法を使いましょう。

```go title="フィールド名省略による構造体リテラル (非推奨)"
package main

import "fmt"

type Vector struct {
	X, Y, Z int
}

func main() {
	// フィールド名を省略し、定義順 (X, Y, Z) に値を指定
	v1 := Vector{1, 2, 3}
	fmt.Printf("v1: %+v\n", v1)

	// すべてのフィールドを指定する必要がある
	// v2 := Vector{1, 2} // コンパイルエラー: too few values in Vector literal
}

/* 実行結果:
v1: {X:1 Y:2 Z:3}
*/
```

## `new` 関数による作成 (ポインタ)

組み込み関数の `new(型)` を使うと、指定した型の**ゼロ値**で初期化された値を作成し、その値への**ポインタ**を返します。

**構文:** `変数名 := new(構造体名)`

*   `new(構造体名)` は、`構造体名` 型の新しい値をメモリ上に確保し、すべてのフィールドをゼロ値で初期化します。
*   そして、その確保された値への**ポインタ (`*構造体名` 型)** を返します。

```go title="new 関数による構造体ポインタの作成"
package main

import "fmt"

type Rectangle struct {
	Width, Height int
}

func main() {
	// new(Rectangle) は *Rectangle 型のポインタを返す
	// 指し示す先の Rectangle はゼロ値 {Width:0 Height:0} で初期化される
	rectPtr := new(Rectangle)

	fmt.Printf("rectPtr の型: %T\n", rectPtr)
	fmt.Printf("rectPtr が指す値 (初期): %+v\n", *rectPtr) // * でポインタが指す先の値を取得

	// ポインタを通じてフィールドにアクセス・代入できる
	// Go では (*rectPtr).Width = 10 の代わりに rectPtr.Width = 10 と書ける
	rectPtr.Width = 10
	rectPtr.Height = 5
	fmt.Printf("rectPtr が指す値 (変更後): %+v\n", *rectPtr)

	// 比較: 構造体リテラルでポインタを作成する場合
	// & を使うとリテラルで作成した値へのポインタを取得できる
	rectPtr2 := &Rectangle{Width: 20, Height: 8}
	fmt.Printf("\nrectPtr2 の型: %T\n", rectPtr2)
	fmt.Printf("rectPtr2 が指す値: %+v\n", *rectPtr2)
}

/* 実行結果:
rectPtr の型: *main.Rectangle
rectPtr が指す値 (初期): {Width:0 Height:0}
rectPtr が指す値 (変更後): {Width:10 Height:5}

rectPtr2 の型: *main.Rectangle
rectPtr2 が指す値: {Width:20 Height:8}
*/
```

**`new` vs 構造体リテラル (`&{...}`):**

*   `new(T)` は常にゼロ値で初期化された `*T` を返します。
*   `&T{...}` はリテラルで指定した値で初期化された `*T` を返します。
*   どちらも構造体のポインタを作成する方法ですが、初期値を指定したい場合は `&T{...}` の方が一般的で簡潔です。ゼロ値のポインタが必要な場合に `new(T)` が使われることがあります。

構造体の値を作成する際は、フィールド名を指定するリテラル (`T{FieldName: value, ...}`) を使うのが最も安全で推奨される方法です。