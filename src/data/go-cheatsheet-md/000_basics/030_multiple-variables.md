---
title: "複数の変数をまとめて宣言する"
tags: ["basics", "変数", "var", ":="]
---

プログラムを書いていると、関連する複数の変数を一度に宣言したくなることがあります。Go言語には、そのような場合に便利な方法がいくつか用意されています。

## `var()` ブロックを使った宣言

`var` キーワードの後に括弧 `()` を続けることで、複数の変数をまとめて宣言できます。型が異なる変数も一緒に宣言できるため、関連する変数をグループ化するのに役立ちます。

```go title="var() ブロックでの複数変数宣言"
package main

import "fmt"

// var() ブロックは関数外 (パッケージレベル) でも使用可能
var (
	appName    string = "Go Cheatsheet" // アプリケーション名 (文字列)
	version    int    = 1               // バージョン (整数)
	isReleased bool   = false           // リリース状態 (真偽値)
)

func main() {
	// 関数内でも var() ブロックは使える
	var (
		width, height int    = 100, 50 // 同じ型の変数を一行で宣言・初期化
		borderColor   string = "red"   // 別の型の変数
	)

	fmt.Println("アプリケーション名:", appName)
	fmt.Println("バージョン:", version)
	fmt.Println("リリース済み:", isReleased)
	fmt.Println("幅:", width)
	fmt.Println("高さ:", height)
	fmt.Println("境界線の色:", borderColor)
}

/* 実行結果:
アプリケーション名: Go Cheatsheet
バージョン: 1
リリース済み: false
幅: 100
高さ: 50
境界線の色: red
*/
```

**コード解説:**

*   `var (...)`: このブロック内に、宣言したい変数を一行ずつ記述します。
*   `width, height int = 100, 50`: 同じ型の変数は、カンマ `,` で区切って一行で宣言し、対応する初期値を設定できます。`width` に `100` が、`height` に `50` が代入されます。

## 一行での複数変数宣言 (同じ型)

同じ型の変数を複数宣言する場合、`var()` ブロックを使わずに一行で書くこともできます。

```go title="一行での複数変数宣言 (同じ型)"
package main

import "fmt"

func main() {
	// 同じ string 型の変数を一行で宣言
	var firstName, lastName string = "太郎", "山田"

	// 同じ int 型の変数を一行で宣言 (初期値なし、ゼロ値で初期化)
	var x, y, z int

	fmt.Println("姓:", lastName, "名:", firstName)
	fmt.Println("x:", x, "y:", y, "z:", z) // ゼロ値 (0) が表示される
}

/* 実行結果:
姓: 山田 名: 太郎
x: 0 y: 0 z: 0
*/
```

## `:=` を使った複数変数の宣言・初期化

短縮変数宣言 `:=` も、複数の変数を同時に宣言・初期化するために使用できます。左辺の変数名と右辺の値をカンマ `,` で区切って対応させます。

```go title="`:=` を使った複数変数の宣言・初期化"
package main

import "fmt"

func main() {
	// `:=` を使って複数の変数を宣言・初期化
	// 左辺の変数と右辺の値が順番に対応する
	name, age, city := "花子", 25, "東京" // name は string, age は int, city は string と推論される

	fmt.Println("名前:", name)
	fmt.Println("年齢:", age)
	fmt.Println("都市:", city)

	// 関数の戻り値を受け取る際にもよく使われる
	file, err := openFile("mydata.txt") // openFile 関数が (ファイル情報, エラー情報) の2つの値を返すと仮定
	if err != nil {
		fmt.Println("ファイルを開けませんでした:", err)
	} else {
		fmt.Println("ファイルを開きました:", file)
		// file を使った処理...
	}
}

// ダミーの関数 (説明用)
func openFile(filename string) (string, error) {
	// 実際にはファイルを開く処理
	if filename == "mydata.txt" {
		return "ファイルの内容...", nil // 成功時はファイル情報と nil (エラーなし) を返す
	}
	return "", fmt.Errorf("ファイル %s が見つかりません", filename) // 失敗時は空情報とエラーを返す
}

/* 実行結果 (mydata.txt が存在する場合の例):
名前: 花子
年齢: 25
都市: 東京
ファイルを開きました: ファイルの内容...
*/
```

**ポイント:**

*   `:=` の場合、左辺の変数と右辺の値の数が一致している必要があります。
*   関数の戻り値が複数ある場合、それらを `:=` を使って一度に受け取ることができます。これはGoで非常に一般的なパターンです（特にエラー処理）。

これらの方法を使い分けることで、コードの可読性を保ちながら効率的に変数を宣言できます。