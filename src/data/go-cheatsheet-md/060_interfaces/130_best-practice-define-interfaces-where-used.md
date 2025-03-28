---
title: "インターフェースのベストプラクティス: 利用する側でインターフェースを定義する"
tags: ["interfaces", "interface", "ベストプラクティス", "設計原則", "依存関係", "疎結合", "パッケージ"]
---

Goのインターフェース設計におけるもう一つの重要なベストプラクティスは、**インターフェースを、それを実装する側ではなく、それを利用する側（クライアント側）のパッケージで定義する**というものです。

## なぜ利用側で定義するのか？

これは、**依存関係の方向**を適切に管理し、**パッケージ間の結合度を低く保つ**ためです。

*   **実装の詳細からの分離:** インターフェースを利用する側のパッケージ（クライアント）は、「どのような振る舞いが必要か」だけをインターフェースとして定義します。クライアントは、そのインターフェースを実装する具体的な型（例えば、データベースアクセスを行うパッケージ）の詳細を知る必要がなくなります。
*   **依存関係の逆転:** 通常、クライアントは依存するライブラリやサービス（実装側）に依存します。しかし、インターフェースを利用側で定義すると、実装側のパッケージが、利用側で定義されたインターフェースに依存する形になります（実装するためにインターフェースを知る必要がある）。これにより、依存関係の方向が逆転し、クライアントは実装の詳細から切り離されます。
*   **不要な依存の回避:** 実装側のパッケージがインターフェースを定義すると、クライアントはそのインターフェースを利用するためだけに、実装側のパッケージ全体をインポートしなければならなくなる可能性があります。利用側でインターフェースを定義すれば、クライアントは実装側のパッケージを直接インポートする必要がなくなります（依存性の注入などを使う場合）。

## コード例: ユーザーサービスとデータストア

例として、ユーザー情報を処理する `userservice` パッケージと、実際にデータを永続化する `datastore` パッケージを考えます。`userservice` はユーザーデータの取得や保存を行うために `datastore` の機能を利用しますが、直接 `datastore` に依存するのではなく、必要な振る舞いをインターフェースとして定義します。

**ディレクトリ構造:**
```
myapp/
├── go.mod
├── main.go
├── userservice/
│   ├── service.go      # UserStorer インターフェースを定義、利用
│   └── user.go         # User 構造体
└── datastore/
    └── postgres.go     # UserStorer インターフェースを実装
```

**`userservice/user.go`:**
```go
package userservice

// User 構造体 (具体的なデータ型)
type User struct {
	ID   int
	Name string
}
```

**`userservice/service.go`:** (インターフェースを定義・利用する側)
```go
package userservice

import "fmt"

// ★★★ インターフェースを利用側 (userservice) で定義 ★★★
// UserStorer インターフェース: ユーザーデータの保存と取得に必要なメソッドを定義
type UserStorer interface {
	GetUser(id int) (*User, error)
	SaveUser(user *User) error
}

// Service: UserStorer インターフェースに依存するサービス
type Service struct {
	Store UserStorer // 具体的なデータストア (例: *datastore.PostgresDB) ではなくインターフェースを持つ
}

// NewService: Service を作成するコンストラクタ
func NewService(store UserStorer) *Service {
	return &Service{Store: store}
}

// GetUserName: ユーザー名を取得するメソッド (UserStorer を利用)
func (s *Service) GetUserName(id int) (string, error) {
	user, err := s.Store.GetUser(id) // インターフェース経由でメソッド呼び出し
	if err != nil {
		return "", fmt.Errorf("ユーザー取得失敗: %w", err)
	}
	return user.Name, nil
}

// SaveNewUser: 新しいユーザーを保存するメソッド (UserStorer を利用)
func (s *Service) SaveNewUser(id int, name string) error {
	user := &User{ID: id, Name: name}
	err := s.Store.SaveUser(user) // インターフェース経由でメソッド呼び出し
	if err != nil {
		return fmt.Errorf("ユーザー保存失敗: %w", err)
	}
	fmt.Printf("ユーザー '%s' (ID: %d) を保存しました。\n", name, id)
	return nil
}
```

**`datastore/postgres.go`:** (インターフェースを実装する側)
```go
package datastore

import (
	"fmt"
	"myapp/userservice" // userservice パッケージをインポート (User 型と UserStorer インターフェースを利用するため)
)

// PostgresDB: UserStorer インターフェースを実装する具体的な型 (例)
type PostgresDB struct {
	// (データベース接続情報など)
	data map[int]*userservice.User // 簡単のためマップでデータを保持
}

// NewPostgresDB: PostgresDB を作成するコンストラクタ
func NewPostgresDB() *PostgresDB {
	return &PostgresDB{
		data: make(map[int]*userservice.User),
	}
}

// GetUser: UserStorer インターフェースのメソッドを実装
func (db *PostgresDB) GetUser(id int) (*userservice.User, error) {
	fmt.Printf("  (PostgresDB: ID %d を検索中...)\n", id)
	user, ok := db.data[id]
	if !ok {
		return nil, fmt.Errorf("DBエラー: ユーザー %d が見つかりません", id)
	}
	return user, nil
}

// SaveUser: UserStorer インターフェースのメソッドを実装
func (db *PostgresDB) SaveUser(user *userservice.User) error {
	fmt.Printf("  (PostgresDB: ID %d のユーザー '%s' を保存中...)\n", user.ID, user.Name)
	if _, exists := db.data[user.ID]; exists {
		// 簡単のため、既に存在する場合はエラーとする
		return fmt.Errorf("DBエラー: ユーザー ID %d は既に存在します", user.ID)
	}
	db.data[user.ID] = user
	return nil
}

// ★★★ PostgresDB は userservice.UserStorer インターフェースを実装している ★★★
// (明示的な implements は不要)
```

**`main.go`:** (依存性の注入)
```go
package main

import (
	"fmt"
	"myapp/datastore"   // 実装を提供するパッケージ
	"myapp/userservice" // インターフェースを利用するパッケージ
)

func main() {
	// 1. 具体的なデータストア (実装) を作成
	db := datastore.NewPostgresDB()

	// 2. サービスを作成し、データストア (インターフェースを満たすもの) を注入
	//    NewService は UserStorer インターフェースを受け取る
	service := userservice.NewService(db) // db は UserStorer を実装しているので渡せる

	// 3. サービスを利用する
	err := service.SaveNewUser(1, "Alice")
	if err != nil {
		fmt.Println(err)
	}
	err = service.SaveNewUser(2, "Bob")
	if err != nil {
		fmt.Println(err)
	}

	name, err := service.GetUserName(1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("取得したユーザー名: %s\n", name)
	}

	_, err = service.GetUserName(3) // 存在しないユーザー
	if err != nil {
		fmt.Println(err)
	}
}

/* 実行結果:
  (PostgresDB: ID 1 のユーザー 'Alice' を保存中...)
ユーザー 'Alice' (ID: 1) を保存しました。
  (PostgresDB: ID 2 のユーザー 'Bob' を保存中...)
ユーザー 'Bob' (ID: 2) を保存しました。
  (PostgresDB: ID 1 を検索中...)
取得したユーザー名: Alice
  (PostgresDB: ID 3 を検索中...)
ユーザー取得失敗: DBエラー: ユーザー 3 が見つかりません
*/
```

**コード解説:**

*   `userservice` パッケージは、自身が必要とするデータ永続化の振る舞いを `UserStorer` インターフェースとして**定義**しています。`Service` 構造体はこのインターフェースに依存します。`userservice` は `datastore` パッケージのことを**知りません**。
*   `datastore` パッケージは、`userservice` パッケージをインポートし、`userservice.UserStorer` インターフェースを**実装**します (`PostgresDB` 型が `GetUser` と `SaveUser` メソッドを提供)。`datastore` は `userservice` に依存しています。
*   `main` パッケージは、具体的な実装である `datastore.PostgresDB` のインスタンスを作成し、それを `userservice.NewService` に渡します。`NewService` は `UserStorer` インターフェースを受け取るため、`*PostgresDB` を受け入れることができます（依存性の注入）。
*   これにより、`userservice` は具体的なデータストアの実装から切り離され、例えばテスト時には `datastore.PostgresDB` の代わりにモック実装を `NewService` に渡すことが容易になります。

この原則に従うことで、パッケージ間の依存関係が明確になり、よりテストしやすく、変更に強いソフトウェアを構築することができます。