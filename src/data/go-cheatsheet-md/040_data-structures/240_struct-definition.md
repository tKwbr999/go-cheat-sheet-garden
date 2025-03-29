## タイトル
title: データ構造: 構造体 (Struct) の定義

## タグ
tags: ["data-structures", "構造体", "struct", "type", "フィールド", "値型"]

## コード
```go
package main

import "fmt"

// Address 構造体
type Address struct {
	Street string // 公開フィールド
	City   string // 公開フィールド
	zip    string // 非公開フィールド
}

// Person 構造体
type Person struct {
	Name    string
	Age     int
	Email   string
	address *Address // ポインタ型フィールド (非公開)
	hobbies []string // スライス型フィールド (非公開)
}

func main() {
	// Person 型変数をゼロ値で宣言
	var p1 Person
	fmt.Printf("p1 (ゼロ値): %+v\n", p1)
	// 出力例: {Name: Age:0 Email: address:<nil> hobbies:[]}

	// Address 型変数をゼロ値で宣言
	var addr Address
	fmt.Printf("addr (ゼロ値): %+v\n", addr)
	// 出力例: {Street: City: zip:}
}

```

## 解説
```text
異なる型のデータをひとまとめにして新しい型を定義するには
**構造体 (Struct)** を使います。関連データをグループ化します。

**構造体とは？**
*   **フィールド (Field)** と呼ばれる名前付き要素の集まり。
*   各フィールドは異なる型を持てる。
*   `type` キーワードで新しい構造体型を定義。

**定義構文:**
```go
type 構造体名 struct {
    フィールド名1 型1
    フィールド名2 型2
    // ...
}
```
*   `構造体名`: 新しい型の名前 (通常アッパーキャメルケース)。
*   `struct`: 構造体型を示す。
*   `フィールド名 型`: フィールド名と型を指定。
    フィールド名が大文字始まりならエクスポート (公開)、
    小文字始まりなら非公開。

コード例では `Address` と `Person` という構造体を定義しています。
`Person` は `Address` へのポインタ (`*Address`) や
文字列スライス (`[]string`) もフィールドとして持てます。

**ゼロ値:**
`var p1 Person` のように初期値なしで宣言すると、
構造体の各フィールドはそれぞれの型の**ゼロ値**で初期化されます
(string="", int=0, pointer=nil, slice=nil)。
構造体自体が `nil` になるわけではありません。

**構造体は値型:**
配列と同様、構造体も**値型**です。
変数代入 (`p2 := p1`) や関数への引数渡しでは、
全フィールドの値が**コピー**されます。
コピー先のフィールドを変更しても、通常は元の構造体には
影響しません。
(ただし、ポインタフィールドの場合、コピーされるのは
ポインタであり、参照先のデータは共有されます。)

構造体で関連データをまとめ、コードを分かりやすく構成できます。