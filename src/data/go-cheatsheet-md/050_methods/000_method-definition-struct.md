## タイトル
title: メソッド: 構造体 (Struct) に振る舞いを追加する

## タグ
tags: ["methods", "struct", "レシーバ", "func"]

## コード
```go
package main

import "fmt"

type Rectangle struct {
	Width, Height float64
}

// Area メソッド (値レシーバ)
func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

// Scale メソッド (ポインタレシーバ)
func (r *Rectangle) Scale(factor float64) {
	if r == nil { return }
	r.Width *= factor  // 元の値を変更
	r.Height *= factor // 元の値を変更
	fmt.Printf("  (Scale内: W=%.1f, H=%.1f)\n", r.Width, r.Height)
}

func main() {
	rect := Rectangle{Width: 10, Height: 5}
	fmt.Printf("初期状態: %+v\n", rect)

	// メソッド呼び出し (変数.メソッド名())
	area := rect.Area() // rect がレシーバ (値渡し)
	fmt.Printf("面積: %.1f\n", area)

	fmt.Println("Scale(2) 呼び出し...")
	rect.Scale(2) // rect のアドレスがレシーバに渡される
	fmt.Printf("Scale後: %+v\n", rect) // rect の値が変更されている
}

```

## 解説
```text
Goでは**メソッド (Method)** を使い、型（特に構造体）に
**振る舞い（操作）**を追加できます。データ（フィールド）と
ロジック（メソッド）をまとめます。

**メソッドとは？**
特定の型（**レシーバ型**）に関連付けられた関数です。
`func` とメソッド名の間に**レシーバ**を指定します。

**構造体メソッド定義:**
`func (レシーバ名 レシーバ型) メソッド名(引数) 戻り値 { ... }`
*   `(レシーバ名 レシーバ型)`: メソッドがどの型に属するか定義。
    *   `レシーバ型`: `Rectangle` や `*Rectangle` など。
    *   `レシーバ名`: メソッド内でインスタンスを参照する変数 (例: `r`)。
*   `メソッド名`, `引数`, `戻り値`, `{...}`: 通常の関数と同様。

コード例では `Rectangle` 型に `Area` と `Scale` メソッドを定義。

**レシーバの種類:**
*   **値レシーバ (`r Rectangle`)**: メソッドにはレシーバの値の
    **コピー**が渡されます。メソッド内でレシーバのフィールドを
    変更しても、呼び出し元の値は**変わりません**。(`Area` メソッド)
*   **ポインタレシーバ (`r *Rectangle`)**: メソッドにはレシーバの
    **ポインタ**が渡されます。メソッド内でフィールドを変更すると、
    呼び出し元の**値も変更されます**。(`Scale` メソッド)

**メソッド呼び出し:**
`変数名.メソッド名(引数)`
例: `rect.Area()`, `rect.Scale(2)`

Goは呼び出し時にレシーバの型を自動調整します。
*   値変数 (`rect`) でポインタレシーバメソッド (`Scale`) を
    呼び出すと、Goは自動的に `(&rect).Scale(2)` のように
    アドレスを渡します。
*   ポインタ変数 (`rectPtr`) で値レシーバメソッド (`Area`) を
    呼び出すと、Goは自動的に `(*rectPtr).Area()` のように
    値を渡します。

メソッドで型に振る舞いを持たせ、コードをより
オブジェクト指向的に構成できます。
値レシーバとポインタレシーバの使い分けが重要です。