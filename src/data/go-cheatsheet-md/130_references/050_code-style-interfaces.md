## タイトル
title: インターフェース (Interfaces)

## タグ
tags: ["references", "code style", "interfaces", "naming", "er suffix", "interface segregation"]

## コード
```go
// 単一メソッドの例
type Reader interface {
	Read(p []byte) (n int, err error)
}

type Writer interface {
	Write(p []byte) (n int, err error)
}

// 複数のメソッドの例
type ReadWriter interface {
	Reader // インターフェースの埋め込み
	Writer
}

type Shape interface {
    Area() float64
    Perimeter() float64
}
```

## 解説
```text
インターフェースは Go のポリモーフィズム（多態性）を実現する中心的な機能であり、柔軟で疎結合なコードを書くために不可欠です。インターフェースの設計と使い方に関する Go の慣習とスタイルは以下の通りです。

## インターフェース名

*   **`-er` サフィックス:** 単一のメソッドを持つインターフェースの名前は、そのメソッド名に `-er` を付けるのが強い慣習です。これは、そのインターフェースが「～するもの」という能力を表すことを示唆します。
    *   `Read() ...` メソッドを持つ -> `Reader` (`io.Reader`)
    *   `Write() ...` メソッドを持つ -> `Writer` (`io.Writer`)
    *   `ServeHTTP(...)` メソッドを持つ -> `Handler` (`http.Handler`)
    *   `String() string` メソッドを持つ -> `Stringer` (`fmt.Stringer`)
*   **複数のメソッド:** 複数のメソッドを持つインターフェースには、必ずしも `-er` を付ける必要はありません。そのインターフェースが表現する概念を表す名前を付けます（例: `sort.Interface`, `database/sql.DB`）。
*   **`I` プレフィックスは不要:** 他の言語で見られるような `IMyInterface` のようなプレフィックスは Go では使いません。

## インターフェースのサイズ

*   **小さく保つ (Interface Segregation Principle):** Go では、**小さなインターフェース**（メソッド数が少ない、理想的には1つ）を組み合わせることが推奨されます。大きなインターフェースは、実装する側に多くの負担を強いるだけでなく、不必要な依存関係を生み出す可能性があります。
*   必要なメソッドだけを持つ小さなインターフェースを定義することで、実装の柔軟性が高まり、モック化も容易になります。

```go
// 悪い例: 大きすぎるインターフェース
type MegaStorage interface {
    Open(path string) error
    Close() error
    Read(p []byte) (int, error)
    Write(p []byte) (int, error)
    Seek(offset int64, whence int) (int64, error)
    Truncate(size int64) error
    // ... さらに多くのメソッド ...
}

// 良い例: 小さなインターフェースに分割
type Opener interface { Open(path string) error }
type Closer interface { Close() error }
type Reader interface { Read(p []byte) (int, error) } // 上で定義済みだが例として再掲
type Writer interface { Write(p []byte) (int, error) } // 上で定義済みだが例として再掲
type Seeker interface { Seek(offset int64, whence int) (int64, error) }

// 必要に応じて組み合わせる
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

## インターフェースを定義する場所

*   **利用側で定義する:** Go の特徴的な考え方として、「インターフェースはそれを利用する側（消費者側）で定義する」というものがあります。
*   つまり、ある関数が特定の機能（例えば `Read`）を必要とする場合、その関数が定義されているパッケージ内で `Reader` インターフェースを（もし標準ライブラリになければ）定義します。
*   これにより、関数が必要とする最小限の振る舞いだけをインターフェースとして定義でき、具体的な実装を提供する側（生産者側）はそのインターフェースを意識する必要がなくなります（暗黙的なインターフェース実装のため）。
*   ただし、標準ライブラリ (`io.Reader` など) や、広く使われることが想定されるインターフェースは、提供側のパッケージで定義されることもあります。

```go
package userdb // ユーザーデータを扱うパッケージ (例)

import "context"

// User 型 (例)
type User struct {
	ID   string
	Name string
}

// UserFinder は ID でユーザーを見つける機能を要求するインターフェース
// このインターフェースは userdb パッケージ (利用側) で定義される
type UserFinder interface {
	FindByID(ctx context.Context, id string) (*User, error)
}

// GetUserName は UserFinder を使ってユーザー名を取得する
func GetUserName(ctx context.Context, finder UserFinder, userID string) (string, error) {
	user, err := finder.FindByID(ctx, userID)
	if err != nil {
		return "", err
	}
	return user.Name, nil
}

// --- 別のパッケージ (例: postgres) ---
// package postgres
//
// import "context"
// import "path/to/userdb" // User 型を使うため
//
// // DB は FindByID メソッドを持つ (UserFinder を満たす)
// type DB struct { /* ... */ }
// func (db *DB) FindByID(ctx context.Context, id string) (*userdb.User, error) { /* ... */ }
// func NewDB() *DB { /* ... */ return &DB{} } // 仮のコンストラクタ

// --- さらに別のパッケージ (例: cache) ---
// package cache
//
// import "context"
// import "path/to/userdb" // User 型を使うため
//
// // Cache も FindByID メソッドを持つ (UserFinder を満たす)
// type Cache struct { /* ... */ }
// func (c *Cache) FindByID(ctx context.Context, id string) (*userdb.User, error) { /* ... */ }
// func NewCache() *Cache { /* ... */ return &Cache{} } // 仮のコンストラクタ

// --- main パッケージ ---
// func main() {
// 	db := postgres.NewDB()
// 	cache := cache.NewCache()
//
// 	// GetUserName は具体的な実装 (DB や Cache) を知らなくても動作する
// 	name1, _ := userdb.GetUserName(context.Background(), db, "user1")
// 	name2, _ := userdb.GetUserName(context.Background(), cache, "user2")
//  fmt.Println(name1, name2) // 実行結果の確認用
// }
```

## まとめ

*   インターフェース名は、単一メソッドの場合は `-er` サフィックスを付けるのが慣習。
*   インターフェースは小さく、必要なメソッドだけを持つように設計する。
*   インターフェースは、多くの場合、それを利用する側で定義する。

これらの原則に従うことで、Goのインターフェースの利点を最大限に活かし、柔軟でテストしやすく、再利用性の高いコードを書くことができます。