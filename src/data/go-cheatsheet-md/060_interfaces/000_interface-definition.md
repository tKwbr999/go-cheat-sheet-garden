## タイトル
title: 振る舞いの契約を定義する

## タグ
tags: ["interfaces", "interface", "メソッドシグネチャ", "契約", "ポリモーフィズム"]

## コード
```go
package main

import "fmt"

// Shape 振る舞いを定義
type Shape interface {
	Area() float64      // 面積を返すメソッド
	Perimeter() float64 // 周長を返すメソッド
}

// Shape インターフェース型の引数を受け取る関数
// 具体的な型 (Rectangle, Circle 等) を知らなくても動作する
func printShapeInfo(s Shape) {
	if s == nil {
		fmt.Println("図形が nil です")
		return
	}
	fmt.Printf("図形情報: %T\n", s) // 実行時の具体的な型が表示される
	fmt.Printf("  面積: %.2f\n", s.Area())      // インターフェースのメソッドを呼び出す
	fmt.Printf("  周長: %.2f\n", s.Perimeter()) // インターフェースのメソッドを呼び出す
}

func main() {
	// インターフェース型のゼロ値は nil
	var s Shape
	fmt.Printf("初期状態 s: %v (%T)\n", s, s) // <nil> (<nil>)
	// printShapeInfo(s) // s が nil なので Area() 呼び出しで panic する

	// (次のセクションで具体的な型を Shape として使う例を示す)
}

```

## 解説
```text
Goの**インターフェース (Interface)** は、具体的な実装を持たず、
**どのようなメソッドを持っているべきか**という
**メソッドシグネチャの集まり**だけを定義します。
型が満たすべき**契約 (Contract)** や**仕様**のようなものです。

**インターフェースとは？**
*   メソッドシグネチャの集まり (名前, 引数, 戻り値)。
*   型が「何ができるか」(振る舞い) を定義する。
*   具体的なデータを持たない**抽象型**。
*   同じインターフェースを満たす異なる型を統一的に扱う
    **ポリモーフィズム**を実現する。

**定義構文:**
```go
type インターフェース名 interface {
    メソッド名1(引数リスト1) 戻り値リスト1
    メソッド名2(引数リスト2) 戻り値リスト2
    // ...
}
```
*   `interface` キーワードを使用。
*   `{}` 内に要求するメソッドシグネチャを記述。

コード例では `Shape` インターフェースを定義し、
`Area() float64` と `Perimeter() float64` という
2つのメソッドを持つことを要求しています。

`printShapeInfo` 関数は引数に `Shape` インターフェース型を
取ります。これは、「`Area()` と `Perimeter()` メソッドを
持っていればどんな型の値でも受け取れる」ことを意味します。
関数内では、渡された値の具体的な型 (例: `Rectangle`, `Circle`) を
知らなくても、インターフェースが保証するメソッドを
呼び出すことができます (`s.Area()`, `s.Perimeter()`)。

**ゼロ値:**
インターフェース型のゼロ値は `nil` です。
`nil` のインターフェース変数に対してメソッドを呼び出すと
`panic` が発生します。

インターフェースは、型の実装と振る舞いを分離する
強力な抽象化メカニズムであり、柔軟で拡張性の高い
コード設計を可能にします。