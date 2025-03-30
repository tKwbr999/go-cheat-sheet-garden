## タイトル
title: 構造体 (Struct) のフィールドへのアクセス

## タグ
tags: ["data-structures", "構造体", "struct", "フィールド", "アクセス", "代入", "ドット演算子", "ポインタ"]

## コード
```go
package main

import "fmt"

type User struct {
	ID       int
	Username string
	IsActive bool
	profile  string // 非公開フィールド
}

func main() {
	u1 := User{ID: 1, Username: "gopher", IsActive: true, profile: "Go dev"}
	fmt.Printf("初期状態 u1: %+v\n", u1)

	// フィールド値の読み取り
	userID := u1.ID
	username := u1.Username
	fmt.Printf("ID: %d, Username: %s\n", userID, username)
	// fmt.Println(u1.profile) // 同パッケージ内ならアクセス可

	// フィールド値の書き込み (代入)
	u1.Username = "gopher_new"
	u1.IsActive = false
	fmt.Printf("変更後 u1: %+v\n", u1)

	// ゼロ値の構造体へのアクセス
	var u2 User
	fmt.Printf("\nゼロ値 u2.ID: %d\n", u2.ID) // 0
	u2.ID = 2
	fmt.Printf("変更後 u2: %+v\n", u2)
}

```

## 解説
```text
構造体の内部フィールドにアクセスするには
**ドット演算子 (`.`)** を使います。

**構文:** `構造体変数名.フィールド名`

この構文で、フィールド値の**読み取り**も
新しい値の**書き込み（代入）**も可能です。

**アクセス制限:**
フィールド名が小文字で始まる（エクスポートされていない）場合、
そのフィールドは構造体が定義されたパッケージの
外部からはアクセスできません。
(コード例の `profile` は `main` パッケージ内なのでアクセス可)

**ゼロ値構造体:**
ゼロ値で初期化された構造体のフィールドにも
アクセス・代入が可能です (例: `u2.ID`)。

**ポインタ経由でのアクセス:**
構造体への**ポインタ** (`ptr`) を持っている場合でも、
同じくドット演算子 (`.`) でフィールドにアクセスできます。
`ptr.FieldName`
Goが自動的にポインタをデリファレンスするため、
`(*ptr).FieldName` と書く必要はありません
(書いても動作します)。これは便利なシンタックスシュガーです。

ドット演算子は構造体データを利用する基本操作です。