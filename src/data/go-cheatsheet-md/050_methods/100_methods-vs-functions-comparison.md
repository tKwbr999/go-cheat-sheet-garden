## タイトル
title: メソッド vs 関数: まとめと比較

## タグ
tags: ["methods", "functions", "レシーバ", "比較"]

## コード
```go
package main

import "fmt"

type Rectangle struct {
	Width, Height float64
}

// Rectangle 型に Area メソッドを定義
func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func main() {
	rect := Rectangle{Width: 10, Height: 5}
	fmt.Printf("長方形: %+v\n", rect)

	// メソッド呼び出し
	area := rect.Area()
	fmt.Printf("メソッド呼び出し (rect.Area()): %.1f\n", area)

	// 関数ならこう呼び出す (関数定義は省略)
	// areaFunc := CalculateAreaFunc(rect)
}

```

## 解説
```text
Goの**関数 (Function)** と**メソッド (Method)** の違いをまとめます。

**主な違い:**

| 特徴       | 関数 (Function)                  | メソッド (Method)                     |
| :--------- | :------------------------------- | :------------------------------------ |
| **関連付け** | 特定型に**関連付けられない**   | 特定型（レシーバ型）に**関連付けられる** |
| **レシーバ** | なし                             | あり                                  |
| **呼び出し** | `pkg.Func()` or `Func()`         | `value.Method()`                      |
| **主な用途** | 汎用処理、ユーティリティ         | 型の振る舞いの定義 (OOP的)            |

**コード例比較:**
コード例では `Rectangle` 型に `Area` メソッドを定義しています。
*   **メソッド `Area`:** `Rectangle` 型に関連付けられ (`func (r Rectangle)...`)、
    `rect.Area()` のように `Rectangle` 型変数 `rect` に対して呼び出します。
*   **(比較) 関数:** もし関数で実装するなら `func CalculateAreaFunc(r Rectangle) float64`
    のように定義し、`CalculateAreaFunc(rect)` と呼び出すことになります。

**使い分けガイドライン:**
*   **メソッド:**
    *   特定の型のデータ操作 (`Rectangle` の面積計算など)。
    *   型の「振る舞い」としてカプセル化したい。
    *   オブジェクト指向的な設計。
    *   インターフェース実装のため。
*   **関数:**
    *   型に依存しない汎用処理 (数学関数など)。
    *   複数の異なる型の値を操作する (インターフェースも利用可)。
    *   パッケージレベルのヘルパー関数。

データとその操作は密接なため、Goでは**メソッドを使うことが推奨される場面が多い**です。
特に自作の構造体に対する操作はメソッドとして定義しましょう。