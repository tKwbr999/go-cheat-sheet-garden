---
title: "メソッド: 構造体 (Struct) に振る舞いを追加する"
tags: ["methods", "struct", "レシーバ", "func"]
---

Go言語では、**メソッド (Method)** を使って、定義した型（特に構造体）に**振る舞い（操作）**を追加することができます。これは、データ（構造体のフィールド）とそのデータを操作するロジック（メソッド）を一つにまとめる、オブジェクト指向プログラミングの基本的な考え方に関連しています。

## メソッドとは？

メソッドは、特定の型（**レシーバ型**）に**関連付けられた関数**です。通常の関数と似ていますが、`func` キーワードと関数名の間に**レシーバ (Receiver)** と呼ばれる特別な引数を持ちます。

## 構造体メソッドの定義

構造体に対してメソッドを定義する際の基本的な構文は以下の通りです。

**構文:** `func (レシーバ変数名 レシーバ型) メソッド名(引数リスト) 戻り値リスト { ... }`

*   `func`: メソッド定義の開始を示すキーワード。
*   `(レシーバ変数名 レシーバ型)`: **レシーバ**の定義。
    *   `レシーバ型`: このメソッドがどの型に関連付けられるかを指定します（例: `Rectangle`, `*Rectangle`）。
    *   `レシーバ変数名`: メソッドの本体内で、そのメソッドが呼び出された対象のインスタンス（レシーバの値）を参照するための変数名です（例: `r`）。慣習的に、型の頭文字の小文字などが使われます。
*   `メソッド名`: メソッドの名前。命名規則は関数と同じです（大文字で始まればエクスポートされる）。
*   `引数リスト`, `戻り値リスト`, `{ ... }`: 通常の関数定義と同じです。

## コード例: 長方形 (Rectangle) 構造体

長方形を表す `Rectangle` 構造体を定義し、その面積を計算する `Area` メソッドと、サイズを変更する `Scale` メソッドを定義してみましょう。

```go title="構造体メソッドの定義と呼び出し"
package main

import "fmt"

// --- 構造体の定義 ---
type Rectangle struct {
	Width, Height float64
}

// --- メソッドの定義 ---

// Area メソッド: Rectangle の面積を計算して返す
// レシーバは r Rectangle (値レシーバ)
func (r Rectangle) Area() float64 {
	// レシーバ変数 r を通して、その Rectangle インスタンスの
	// Width と Height フィールドにアクセスできる
	return r.Width * r.Height
}

// Scale メソッド: Rectangle の幅と高さを指定された係数で拡大/縮小する
// レシーバは r *Rectangle (ポインタレシーバ)
// ポインタレシーバを使うと、メソッド内で元の構造体の値を変更できる (詳細は後述)
func (r *Rectangle) Scale(factor float64) {
	if r == nil { // ポインタが nil でないかチェック (安全のため)
		return
	}
	// ポインタレシーバの場合でも、r.Width のように直接フィールドにアクセスできる
	// (*r).Width *= factor と書く必要はない
	r.Width *= factor
	r.Height *= factor
	fmt.Printf("  (Scaleメソッド内: 幅=%.1f, 高さ=%.1f)\n", r.Width, r.Height)
}

func main() {
	// Rectangle のインスタンスを作成
	rect := Rectangle{Width: 10, Height: 5}
	fmt.Printf("初期状態 rect: %+v\n", rect)

	// --- メソッドの呼び出し ---
	// 変数 rect に対してドット (.) を使ってメソッドを呼び出す

	// Area メソッドを呼び出す
	area := rect.Area() // rect がレシーバ r として Area メソッドに渡される (値渡し)
	fmt.Printf("面積 (rect.Area()): %.1f\n", area)

	// Scale メソッドを呼び出す
	fmt.Println("Scale(2) を呼び出し...")
	rect.Scale(2) // rect のアドレスがレシーバ r として Scale メソッドに渡される
	// ポインタレシーバなので、rect の値が直接変更される

	fmt.Printf("Scale(2) 後の rect: %+v\n", rect)

	// 変更後の面積を計算
	areaAfterScale := rect.Area()
	fmt.Printf("変更後の面積: %.1f\n", areaAfterScale)

	// ポインタ変数経由でのメソッド呼び出しも可能
	rectPtr := &Rectangle{Width: 3, Height: 4}
	fmt.Printf("\nrectPtr が指す値: %+v\n", *rectPtr)
	fmt.Printf("面積 (rectPtr.Area()): %.1f\n", rectPtr.Area()) // ポインタでも Area() を呼び出せる
	rectPtr.Scale(0.5) // ポインタ変数で Scale() を呼び出す
	fmt.Printf("Scale(0.5) 後の rectPtr が指す値: %+v\n", *rectPtr)
}

/* 実行結果:
初期状態 rect: {Width:10 Height:5}
面積 (rect.Area()): 50.0
Scale(2) を呼び出し...
  (Scaleメソッド内: 幅=20.0, 高さ=10.0)
Scale(2) 後の rect: {Width:20 Height:10}
変更後の面積: 200.0

rectPtr が指す値: {Width:3 Height:4}
面積 (rectPtr.Area()): 12.0
Scale(0.5) を呼び出し...
  (Scaleメソッド内: 幅=1.5, 高さ=2.0)
Scale(0.5) 後の rectPtr が指す値: {Width:1.5 Height:2}
*/
```

**コード解説:**

*   `func (r Rectangle) Area() float64`: `Rectangle` 型に対する `Area` メソッドを定義しています。レシーバ `r` は `Rectangle` 型（値）です。
*   `func (r *Rectangle) Scale(factor float64)`: `Rectangle` 型に対する `Scale` メソッドを定義しています。レシーバ `r` は `*Rectangle` 型（ポインタ）です。ポインタレシーバを使うことで、メソッド内でレシーバが指す元の構造体のフィールド値を変更できます (`r.Width *= factor`)。
*   `area := rect.Area()`: `Rectangle` 型の変数 `rect` に対して `Area` メソッドを呼び出しています。`rect` の値がレシーバ `r` にコピーされて渡されます。
*   `rect.Scale(2)`: `Rectangle` 型の変数 `rect` に対して `Scale` メソッドを呼び出しています。Goはここで自動的に `rect` のアドレス (`&rect`) をレシーバ `r` に渡します。そのため、`Scale` メソッド内で `rect` の値が変更されます。
*   `rectPtr.Area()`: `*Rectangle` 型のポインタ変数 `rectPtr` に対しても `Area` メソッド（値レシーバ）を呼び出せます。Goが自動的にポインタをデリファレンスして `Area` メソッドに値を渡します。
*   `rectPtr.Scale(0.5)`: ポインタ変数 `rectPtr` に対して `Scale` メソッド（ポインタレシーバ）を呼び出します。

メソッドを使うことで、特定の型のデータとその操作を関連付け、コードをよりオブジェクト指向的に構成することができます。レシーバが値かポインタかによって挙動が変わる点（特に値の変更に関して）は重要であり、後のセクションで詳しく説明します。