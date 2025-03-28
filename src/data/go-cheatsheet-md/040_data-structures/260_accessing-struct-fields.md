---
title: "データ構造: 構造体 (Struct) のフィールドへのアクセス"
tags: ["data-structures", "構造体", "struct", "フィールド", "アクセス", "代入", "ドット演算子", "ポインタ"]
---

構造体の値（インスタンス）を作成したら、その内部の**フィールド**にアクセスして、値を読み取ったり、新しい値を書き込んだりする必要があります。Go言語では、**ドット演算子 (`.`)** を使ってフィールドにアクセスします。

## ドット (`.`) によるフィールドアクセス

**構文:** `構造体変数名.フィールド名`

*   `構造体変数名`: アクセスしたい構造体の値が格納されている変数。
*   `.`: ドット演算子。
*   `フィールド名`: アクセスしたいフィールドの名前。

この構文を使って、フィールドの値を**読み取る**ことも、フィールドに新しい値を**代入する**こともできます。

**注意:** フィールド名が小文字で始まる（エクスポートされていない）場合、そのフィールドは構造体が定義されたパッケージの外部からはアクセスできません。

```go title="構造体フィールドへのアクセスと代入"
package main

import "fmt"

type User struct {
	ID       int
	Username string
	IsActive bool
	profile  string // 小文字なのでパッケージ外からはアクセス不可
}

func main() {
	// 構造体リテラルで User を作成・初期化
	u1 := User{
		ID:       1,
		Username: "gopher",
		IsActive: true,
		profile:  "Go programmer", // 同じパッケージ内なので初期化可能
	}
	fmt.Printf("初期状態 u1: %+v\n", u1)

	// --- フィールド値の読み取り ---
	// ドット演算子を使ってフィールドの値を取得
	userID := u1.ID
	username := u1.Username
	isActive := u1.IsActive
	// profile := u1.profile // 同じパッケージ内なら読み取り可能

	fmt.Printf("ID: %d\n", userID)
	fmt.Printf("Username: %s\n", username)
	fmt.Printf("IsActive: %t\n", isActive)
	// fmt.Printf("Profile: %s\n", profile)

	// --- フィールド値の書き込み (代入) ---
	fmt.Println("\nフィールド値を変更します...")
	u1.Username = "gopher_new" // Username フィールドに新しい値を代入
	u1.IsActive = false
	u1.profile = "Experienced Go programmer" // 同じパッケージ内なら書き込み可能

	fmt.Printf("変更後 u1: %+v\n", u1)

	// --- ゼロ値の構造体へのアクセス ---
	var u2 User // ゼロ値で初期化 {ID:0 Username:"" IsActive:false profile:""}
	fmt.Printf("\nゼロ値 u2: %+v\n", u2)
	fmt.Printf("u2.ID: %d\n", u2.ID) // ゼロ値 0 が読み取れる
	u2.ID = 2 // ゼロ値の構造体のフィールドにも代入可能
	fmt.Printf("変更後 u2: %+v\n", u2)
}

/* 実行結果:
初期状態 u1: {ID:1 Username:gopher IsActive:true profile:Go programmer}
ID: 1
Username: gopher
IsActive: true

フィールド値を変更します...
変更後 u1: {ID:1 Username:gopher_new IsActive:false profile:Experienced Go programmer}

ゼロ値 u2: {ID:0 Username: IsActive:false profile:}
u2.ID: 0
変更後 u2: {ID:2 Username: IsActive:false profile:}
*/
```

## ポインタ経由でのフィールドアクセス

構造体への**ポインタ**を持っている場合でも、フィールドへのアクセスには同じく**ドット演算子 (`.`)** を使います。Go言語が自動的にポインタを**デリファレンス**（ポインタが指す先の値を取得）してくれるため、`(*ptr).FieldName` のように明示的に書く必要はありません（書いても動作します）。

```go title="ポインタ経由でのフィールドアクセス"
package main

import "fmt"

type Config struct {
	Host string
	Port int
}

func main() {
	// 構造体のポインタを作成
	// 方法1: new を使う
	cfgPtr1 := new(Config) // *Config 型、ゼロ値 {Host:"" Port:0} を指す

	// 方法2: 構造体リテラルのアドレスを取る (&)
	cfgPtr2 := &Config{Host: "localhost", Port: 8080} // *Config 型

	fmt.Printf("cfgPtr1 (初期): %+v\n", *cfgPtr1)
	fmt.Printf("cfgPtr2 (初期): %+v\n", *cfgPtr2)

	// --- ポインタ経由でのフィールドアクセスと代入 ---
	// (*cfgPtr1).Host = "example.com" と書かずに、直接 . でアクセスできる
	cfgPtr1.Host = "example.com"
	cfgPtr1.Port = 9000

	cfgPtr2.Port = 443

	fmt.Printf("cfgPtr1 (変更後): %+v\n", *cfgPtr1)
	fmt.Printf("cfgPtr2 (変更後): %+v\n", *cfgPtr2)

	// フィールド値の読み取りも同様
	host := cfgPtr1.Host
	port := cfgPtr2.Port
	fmt.Printf("Host: %s, Port: %d\n", host, port)
}

/* 実行結果:
cfgPtr1 (初期): {Host: Port:0}
cfgPtr2 (初期): {Host:localhost Port:8080}
cfgPtr1 (変更後): {Host:example.com Port:9000}
cfgPtr2 (変更後): {Host:localhost Port:443}
Host: example.com, Port: 443
*/
```

**ポイント:**

*   `cfgPtr1.Host = "..."` のように、ポインタ変数に対しても直接ドット演算子でフィールドにアクセスできます。これはGoの便利なシンタックスシュガー（糖衣構文）です。

ドット演算子によるフィールドアクセスは、構造体に格納されたデータを利用するための基本的な方法です。