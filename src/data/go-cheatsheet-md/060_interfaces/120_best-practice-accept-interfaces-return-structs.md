---
title: "インターフェースのベストプラクティス: インターフェースを受け入れ、構造体を返す"
tags: ["interfaces", "interface", "ベストプラクティス", "設計原則", "疎結合", "struct"]
---

GoのAPI設計において広く知られ、推奨されている原則の一つに**「インターフェースを受け入れ、構造体（具体的な型）を返す (Accept interfaces, return structs)」**というものがあります。これは、関数の引数と戻り値の型をどのように選択すべきかに関するガイドラインです。

## 原則の意味

*   **インターフェースを受け入れる (Accept interfaces):**
    *   関数が何らかの依存関係（他のオブジェクトやサービス）を必要とする場合、引数としては具体的な型（例: `*DatabaseConnection`）ではなく、その関数が必要とする**最小限の振る舞い**を定義した**インターフェース**（例: `UserFinder`）を受け取るように設計します。
    *   **利点:**
        *   **柔軟性・拡張性:** 呼び出し側は、そのインターフェースを満たす任意の型を渡すことができます。将来的に新しい実装が登場しても、関数を変更する必要がありません。
        *   **テスト容易性:** テスト時に、本物の依存オブジェクトの代わりに、インターフェースを満たすモック（テスト用の偽物）を簡単に渡すことができます。
        *   **疎結合:** 関数は具体的な実装の詳細に依存せず、必要な振る舞い（インターフェース）にのみ依存します。

*   **構造体（具体的な型）を返す (Return structs):**
    *   関数が結果として何らかのデータ構造を返す場合、インターフェース型ではなく、**具体的な構造体型**（またはそのポインタ）を返すように設計します。
    *   **利点:**
        *   **明確性:** 呼び出し側は、返された値が具体的にどのようなフィールドやメソッドを持っているかを正確に知ることができます。インターフェースを返すと、呼び出し側は利用可能なメソッドしか知ることができません。
        *   **使いやすさ:** 呼び出し側は、返された構造体のフィールドに直接アクセスできます。インターフェースを返された場合、特定のフィールドにアクセスするには型アサーションが必要になる場合があります。
        *   **将来の拡張性:** 将来的にその構造体に新しいフィールドやメソッドが追加されても、既存の呼び出し側コードは（通常）影響を受けません。もしインターフェースを返していて、後からそのインターフェースにメソッドを追加すると、既存の実装すべてが壊れてしまいます。

## コード例: ユーザー情報の取得

例として、ユーザーIDを指定してユーザー情報を取得する処理を考えます。データストア（データベースなど）へのアクセスが必要です。

```go title="Accept interfaces, return structs の例"
package main

import (
	"fmt"
	"strings"
)

// --- 具体的な型 (返す型) ---
// User 構造体: ユーザー情報を保持する具体的な型
type User struct {
	ID   int
	Name string
	// ... 他のフィールド
}

// --- インターフェース (受け入れる型) ---
// UserGetter インターフェース: ユーザーを取得する振る舞いを定義
// この関数が必要とするのは GetUserByID メソッドだけ
type UserGetter interface {
	GetUserByID(id int) (*User, error) // *User (具体的な型) と error を返す
}

// --- インターフェースの実装 (例1: データベース) ---
// Database: UserGetter インターフェースを実装する具体的な型 (例)
type Database struct {
	// (データベース接続情報など)
	users map[int]*User // 簡単のためマップでデータを保持
}

// Database 型に GetUserByID メソッドを実装
func (db *Database) GetUserByID(id int) (*User, error) {
	fmt.Printf("  (Database: ID %d のユーザーを検索中...)\n", id)
	user, ok := db.users[id]
	if !ok {
		return nil, fmt.Errorf("ユーザーが見つかりません (ID: %d)", id)
	}
	return user, nil
}

// --- インターフェースの実装 (例2: モック) ---
// MockUserGetter: テスト用の UserGetter 実装 (例)
type MockUserGetter struct{}

func (m *MockUserGetter) GetUserByID(id int) (*User, error) {
	fmt.Printf("  (Mock: ID %d のユーザーを検索中...)\n", id)
	if id == 1 {
		return &User{ID: 1, Name: "Mock User"}, nil
	}
	return nil, fmt.Errorf("モックユーザーが見つかりません (ID: %d)", id)
}

// --- インターフェースを利用する関数 ---
// ProcessUser 関数は UserGetter インターフェースを受け取る
// これにより、Database からでも MockUserGetter からでもユーザーを取得できる
func ProcessUser(getter UserGetter, userID int) {
	fmt.Printf("\nProcessUser(%d) を呼び出し\n", userID)
	// インターフェースを通じてメソッドを呼び出す
	user, err := getter.GetUserByID(userID)
	if err != nil {
		fmt.Printf("エラー: %v\n", err)
		return
	}
	// 戻り値は具体的な *User 型なので、フィールドに直接アクセスできる
	fmt.Printf("取得成功: ID=%d, Name=%s\n", user.ID, strings.ToUpper(user.Name))
}

func main() {
	// 実際のデータベース (のつもり) を準備
	db := &Database{
		users: map[int]*User{
			1: {ID: 1, Name: "Alice"},
			2: {ID: 2, Name: "Bob"},
		},
	}

	// モックを準備
	mock := &MockUserGetter{}

	// ProcessUser に Database を渡す
	ProcessUser(db, 1)
	ProcessUser(db, 3) // 存在しない ID

	// ProcessUser に MockUserGetter を渡す (テストなどで有効)
	ProcessUser(mock, 1)
	ProcessUser(mock, 2) // 存在しない ID
}

/* 実行結果:
ProcessUser(1) を呼び出し
  (Database: ID 1 のユーザーを検索中...)
取得成功: ID=1, Name=ALICE

ProcessUser(3) を呼び出し
  (Database: ID 3 のユーザーを検索中...)
エラー: ユーザーが見つかりません (ID: 3)

ProcessUser(1) を呼び出し
  (Mock: ID 1 のユーザーを検索中...)
取得成功: ID=1, Name=MOCK USER

ProcessUser(2) を呼び出し
  (Mock: ID 2 のユーザーを検索中...)
エラー: モックユーザーが見つかりません (ID: 2)
*/
```

**コード解説:**

*   `User` は具体的な**構造体**として定義されています。
*   `UserGetter` は**インターフェース**として定義され、`GetUserByID` というメソッドだけを要求します。このメソッドは具体的な `*User` 型を返すように定義されています。
*   `Database` と `MockUserGetter` は、それぞれ `UserGetter` インターフェースを実装する**具体的な型**です。
*   `ProcessUser` 関数は、引数として具体的な `*Database` や `*MockUserGetter` ではなく、**`UserGetter` インターフェース**を受け取ります。これにより、`ProcessUser` はデータの取得方法の詳細（データベースかモックか）を知る必要がなくなります。
*   `ProcessUser` 関数内で `getter.GetUserByID(userID)` を呼び出すと、渡された具体的な型（`db` または `mock`）のメソッドが実行されます。
*   `GetUserByID` が返すのは具体的な `*User` 型なので、`ProcessUser` は返された `user` の `ID` や `Name` フィールドに**直接アクセス**できます。もし `GetUserByID` がインターフェースを返していたら、フィールドにアクセスするために型アサーションが必要になったでしょう。

この「インターフェースを受け入れ、構造体を返す」原則に従うことで、柔軟性、テスト容易性、明確性を兼ね備えた、より良いAPI設計が可能になります。