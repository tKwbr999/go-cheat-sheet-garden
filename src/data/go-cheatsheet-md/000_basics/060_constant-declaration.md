## タイトル
title: 定数宣言 `const`: 基本的な使い方

## タグ
tags: ["basics", "定数", "const", "基本"]

## コード
```go
package main

import "fmt"

// パッケージレベル定数
const Pi float64 = 3.14159 // 型を明示
const AppName = "MyApp"     // 型を省略 (string と推論)
const MaxUsers = 1000       // 型を省略 (int と推論)
const Enabled = true        // 型を省略 (bool と推論)

func main() {
	// 関数内ローカル定数
	const LocalConst = "ローカル定数"

	fmt.Println("Pi:", Pi)
	fmt.Println("AppName:", AppName)
	fmt.Println("MaxUsers:", MaxUsers)
	fmt.Println("Enabled:", Enabled)
	fmt.Println("LocalConst:", LocalConst)

	// Pi = 3.14 // 定数は再代入不可 (コンパイルエラー)
}

```

## 解説
```text
プログラム実行中に値が変わらない（または変えてはいけない）値は定数として扱います。Go言語では `const` キーワードで宣言します。

**基本構文:**
`const 定数名 [型] = 値`

*   `Pi` のように型 (`float64`) を明示することも、`AppName` のように省略することも可能です。型を省略した場合、コンパイラが右辺の値から型を推論します（型無し定数）。
*   値はコンパイル時に決定できる必要があります（リテラル、他の定数を使った式など）。
*   定数はパッケージレベルまたは関数内で宣言できます。
*   一度宣言した定数の値は変更できません。

**定数と変数の違い:**
*   定数: 変更不可、コンパイル時決定。
*   変数: 変更可能、実行時決定も可。

定数を使うことで、マジックナンバーを避け、コードの可読性と保守性を高められます。