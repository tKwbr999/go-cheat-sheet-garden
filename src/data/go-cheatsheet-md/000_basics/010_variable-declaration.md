## タイトル
title: 変数宣言: 値を記憶する箱 (`var`)

## タグ
tags: ["basics", "変数", "var", "ゼロ値"]

## コード
```go
package main

import "fmt"

func main() {
	// var キーワードで変数を宣言し、初期値を設定
	var message string = "こんにちは、Go!"
	var count int = 10
	var pi float64 = 3.14159
	var enabled bool = true

	fmt.Println(message)
	fmt.Println("カウント:", count)
	fmt.Println("円周率:", pi)
	fmt.Println("有効:", enabled)

	// 初期値を省略するとゼロ値で初期化される
	var name string // ""
	var age int     // 0
	fmt.Println("名前(初期値):", name)
	fmt.Println("年齢(初期値):", age)
}

```

## 解説
```text
プログラムで扱う値を一時的に記憶するのが**変数**です。
Goで変数を宣言する最も基本的な方法は `var` キーワードです。

**`var` を使った変数宣言:**
`var 変数名 型 = 初期値`
*   `var`: 変数宣言を示す。
*   `変数名`: 変数を識別する名前 (例: `message`)。キャメルケースが一般的。
*   `型`: 格納できる値の種類 (例: `string`, `int`, `float64`, `bool`)。
*   `= 初期値`: 宣言と同時に最初の値を設定（初期化）。

**初期値の省略とゼロ値:**
初期値を省略して `var 変数名 型` と宣言すると、変数はその型の**ゼロ値**で自動的に初期化されます。
*   数値型 (`int`, `float64` 等): `0`
*   `bool`: `false`
*   `string`: `""` (空文字列)
*   ポインタ, インターフェース, スライス, チャネル, マップ, 関数: `nil`

コード例では、`message`, `count`, `pi`, `enabled` を初期値付きで宣言し、`name`, `age` を初期値なし（ゼロ値で初期化）で宣言しています。

後から `変数名 = 新しい値` のように値を代入することも可能です。