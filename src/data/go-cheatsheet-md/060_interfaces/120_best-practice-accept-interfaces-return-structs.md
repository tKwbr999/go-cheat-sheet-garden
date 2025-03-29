## タイトル
title: インターフェースのベストプラクティス: インターフェースを受け入れ、構造体を返す

## タグ
tags: ["interfaces", "interface", "ベストプラクティス", "設計原則", "疎結合", "struct"]

## コード
```go
package main

import (
	"fmt"
	"strings"
)

// User 構造体 (返す型: 具体的な構造体)
type User struct {
	ID   int
	Name string
}

// UserGetter インターフェース (受け入れる型: 振る舞いを定義)
type UserGetter interface {
	GetUserByID(id int) (*User, error) // 具体的な *User を返す
}

// --- 実装例 (Database や MockUserGetter などが UserGetter を実装) ---
// (実装詳細は省略、解説参照)
type Database struct { users map[int]*User } // 例
func (db *Database) GetUserByID(id int) (*User, error) { /* ... */ return db.users[id], nil }

// --- インターフェースを利用する関数 ---
// 引数に UserGetter インターフェースを受け取る
func ProcessUser(getter UserGetter, userID int) {
	fmt.Printf("\nProcessUser(%d) 呼び出し\n", userID)
	user, err := getter.GetUserByID(userID) // インターフェース経由で呼び出し
	if err != nil {
		fmt.Printf("エラー: %v\n", err)
		return
	}
	// 戻り値は *User なのでフィールドに直接アクセス可
	fmt.Printf("取得成功: ID=%d, Name=%s\n", user.ID, strings.ToUpper(user.Name))
}

func main() {
	db := &Database{users: map[int]*User{1: {1, "Alice"}}} // 実装例

	// ProcessUser に具体的な実装 (db) をインターフェースとして渡す
	ProcessUser(db, 1)
	ProcessUser(db, 3) // エラー例
}

```

## 解説
```text
GoのAPI設計で推奨される原則:
**「インターフェースを受け入れ、構造体を返す」**

**1. インターフェースを受け入れる (Accept interfaces):**
*   関数が必要とする依存関係は、具体的な型ではなく、
    **最小限の振る舞いを定義したインターフェース**を
    引数として受け取る。
*   **利点:**
    *   **柔軟性:** インターフェースを満たす任意の型を渡せる。
    *   **テスト容易性:** モックを渡しやすくなる。
    *   **疎結合:** 具体的な実装に依存しない。
*   コード例の `ProcessUser` は `UserGetter` インターフェースを
    受け取るため、`Database` でも `MockUserGetter` でも渡せる。

**2. 構造体（具体的な型）を返す (Return structs):**
*   関数が結果データを返す場合、インターフェースではなく
    **具体的な構造体型**（またはそのポインタ）を返す。
*   **利点:**
    *   **明確性:** 呼び出し側は返された値のフィールドやメソッドを
        正確に知ることができる。
    *   **使いやすさ:** フィールドに直接アクセスできる
        (型アサーション不要)。
    *   **将来の拡張性:** 構造体にフィールド等を追加しても
        既存の呼び出し側は影響を受けにくい (インターフェースに
        メソッド追加すると既存実装が壊れる)。
*   コード例の `GetUserByID` は具体的な `*User` を返すため、
    `ProcessUser` は `user.ID` や `user.Name` に直接アクセスできる。

この原則に従うことで、柔軟性、テスト容易性、明確性を
兼ね備えた良いAPI設計が可能になります。