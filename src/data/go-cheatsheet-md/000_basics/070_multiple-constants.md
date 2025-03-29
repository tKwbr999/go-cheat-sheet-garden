## タイトル
title: 複数の定数をまとめて宣言 `const()`

## タグ
tags: ["basics", "定数", "const"]

## コード
```go
package main

import "fmt"

// const() ブロックで関連する定数をまとめる
const (
	StatusOK        = 200 // HTTP OK
	StatusNotFound  = 404 // HTTP Not Found
	InternalError = 500 // HTTP Internal Server Error
	// ... 他のステータスコード
)

func main() {
	fmt.Println("OK:", StatusOK)
	fmt.Println("Not Found:", StatusNotFound)
	fmt.Println("Error:", InternalError)
}

```

## 解説
```text
関連性の高い定数が複数ある場合、`const()` ブロックを使ってまとめて宣言するとコードがすっきりと読みやすくなります。

`const` キーワードの後に括弧 `()` を続け、そのブロック内に宣言したい定数を一行ずつ `定数名 = 値` の形式で記述します。

型は個別に指定することもできますが、右辺の値から推論できる場合は省略するのが一般的です（型無し定数）。

コード例は、HTTPステータスコードのように意味的に関連する数値を定数としてグループ化する例です。これにより、コードの意図が明確になり、可読性が向上します。