## タイトル
title: インターフェースのベストプラクティス: 利用する側でインターフェースを定義する

## タグ
tags: ["interfaces", "interface", "ベストプラクティス", "設計原則", "依存関係", "疎結合", "パッケージ"]

## コード
```go
package userservice // インターフェースを利用する側のパッケージ

import "fmt"

// User 構造体 (例)
type User struct{ ID int; Name string }

// ★★★ インターフェースを利用側で定義 ★★★
// UserStorer: ユーザーの取得・保存に必要な振る舞いを定義
type UserStorer interface {
	GetUser(id int) (*User, error)
	SaveUser(user *User) error
}

// Service: UserStorer インターフェースに依存する
type Service struct {
	Store UserStorer // 具体的な実装ではなくインターフェースを持つ
}

// GetUserName メソッド (UserStorer を利用)
func (s *Service) GetUserName(id int) (string, error) {
	user, err := s.Store.GetUser(id) // インターフェース経由で呼び出し
	if err != nil { return "", fmt.Errorf("取得失敗: %w", err) }
	return user.Name, nil
}

// (NewService や SaveNewUser など他のメソッドは省略)

```

## 解説
```text
Goのインターフェース設計の重要なベストプラクティス:
**インターフェースは、それを実装する側ではなく、
それを利用する側（クライアント側）のパッケージで定義する。**

**なぜ利用側で定義？**
依存関係の方向を適切に管理し、パッケージ間の結合度を
低く保つためです。

*   **実装の詳細からの分離:** 利用側 (例: `userservice`) は
    「必要な振る舞い」だけをインターフェース (例: `UserStorer`)
    として定義します。具体的な実装 (例: `datastore` パッケージ) の
    詳細を知る必要がなくなります。
*   **依存関係の逆転:** 通常クライアント→実装に依存しますが、
    インターフェースを利用側で定義すると、実装側→利用側の
    インターフェースに依存する形になり、クライアントは実装から
    切り離されます。
*   **不要な依存の回避:** 実装側がインターフェースを定義すると、
    利用側が実装パッケージ全体をインポートする必要が
    生じる場合があります。利用側定義ならそれが不要になります
    (依存性の注入を使う場合)。

**コード例の構造:**
1.  `userservice` パッケージが `UserStorer` インターフェースを**定義**し、
    `Service` 構造体がそのインターフェースを**利用**します。
    `userservice` は `datastore` を知りません。
2.  `datastore` パッケージ (別のファイル/パッケージ) が
    `userservice` をインポートし、`UserStorer` インターフェースを
    **実装**します (例: `PostgresDB` 型)。
3.  `main` パッケージ (さらに別の場所) が、具体的な実装
    (`datastore.PostgresDB`) のインスタンスを作成し、
    それを `userservice` のコンストラクタ (`NewService`) に
    **注入**します。`NewService` は `UserStorer` を受け取るため、
    具体的な実装を受け入れられます。

**利点:**
*   `userservice` はデータストアの実装から独立し、テスト時には
    モック実装を注入しやすくなります (テスト容易性)。
*   データストアの実装を変更しても、`userservice` への影響を
    最小限に抑えられます (変更容易性)。

この原則に従うことで、テストしやすく変更に強い
ソフトウェアを構築できます。