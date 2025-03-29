## タイトル
title: "ベストプラクティス: 依存性注入 (DI) にインターフェースを使う"
## タグ
tags: ["references", "best practice", "dependency injection", "di", "interfaces", "疎結合", "テスト容易性"]
**依存性注入 (Dependency Injection, DI)** は、あるコンポーネント（例: `UserService`）が依存する別のコンポーネント（例: `UserRepository`）を、自身で生成するのではなく、**外部から与えられる（注入される）**ように設計する手法です。

Goでは、この依存関係を表現するために**インターフェース**を使うことが非常に効果的であり、ベストプラクティスとされています。

## なぜ DI にインターフェースを使うのか？

*   **疎結合 (Loose Coupling):** コンポーネントが具体的な実装（例: `PostgresUserRepository`）ではなく、抽象的なインターフェース (`UserRepository`) に依存することで、両者の間の結合度が低くなります。`UserRepository` インターフェースを満たすものであれば、将来的に別の実装（例: `MySQLUserRepository`, `InMemoryUserRepository`）に**簡単に差し替える**ことができます。
*   **テスト容易性 (Testability):** テスト時には、本番用の実装（例: 実際のデータベースにアクセスする `PostgresUserRepository`）の代わりに、テスト用の**モック実装 (Mock/Stub)** を注入することができます。これにより、外部依存なしにコンポーネント単体のロジックを簡単にテストできます。
*   **柔軟性と拡張性:** 新しいデータストア実装を追加する場合でも、インターフェースを満たしていれば、既存の `UserService` コードを変更する必要がありません。

## インターフェースを使った DI の実装パターン

1.  **依存される側の機能をインターフェースとして定義:** 依存されるコンポーネントが提供すべきメソッドをインターフェースとして定義します（通常は利用側で定義します）。
    ```go
    // user/service.go
    package service

    // UserRepository はユーザーデータの永続化を担当するインターフェース
    type UserRepository interface {
        FindByID(id string) (*User, error)
        Save(user *User) error
    }
    ```
2.  **依存する側のコンポーネントを定義:** 依存するコンポーネント（例: `UserService`）は、具体的な実装ではなく、**インターフェース型**のフィールドを持ちます。
    ```go
    // user/service.go
    type UserService struct {
        repo UserRepository // ★ インターフェース型のフィールドを持つ
    }
    ```
3.  **コンストラクタでインターフェースを受け取る:** 依存する側のコンストラクタ関数で、インターフェース型の引数を受け取り、それをフィールドに設定します。
    ```go
    // user/service.go
    func NewUserService(repo UserRepository) *UserService {
        return &UserService{repo: repo}
    }

    // UserService のメソッドはインターフェース経由で依存機能を利用
    func (s *UserService) GetUserName(id string) (string, error) {
        user, err := s.repo.FindByID(id) // ★ インターフェースのメソッドを呼び出す
        if err != nil {
            return "", err
        }
        return user.Name, nil
    }
    ```
4.  **具体的な実装を作成:** 依存される側の具体的な実装（例: `PostgresRepo`, `InMemoryRepo`）を作成し、インターフェース (`UserRepository`) が要求するメソッドを実装します。
    ```go
    // user/postgres/repo.go
    package postgres
    type PostgresRepo struct { /* ... DB接続など ... */ }
    func (r *PostgresRepo) FindByID(id string) (*service.User, error) { /* ... DBアクセス ... */ }
    func (r *PostgresRepo) Save(user *service.User) error { /* ... DBアクセス ... */ }

    // user/memory/repo.go
    package memory
    type InMemoryRepo struct { data map[string]*service.User }
    func (r *InMemoryRepo) FindByID(id string) (*service.User, error) { /* ... mapアクセス ... */ }
    func (r *InMemoryRepo) Save(user *service.User) error { /* ... mapアクセス ... */ }
    ```
5.  **組み立て (Wiring):** アプリケーションの初期化時など（例: `main` 関数）で、具体的な実装のインスタンスを生成し、それをコンストラクタに渡して依存関係を注入します。
    ```go
    // main.go
    func main() {
        // 本番環境では PostgresRepo を注入
        dbRepo := postgres.NewPostgresRepo(...)
        userService := service.NewUserService(dbRepo)
        // userService を使った処理...

        // テスト環境では InMemoryRepo を注入できる
        // testRepo := memory.NewInMemoryRepo()
        // testUserService := service.NewUserService(testRepo)
    }
    ```

## コード例

```go title="インターフェースを使った依存性注入"
package main

import (
	"errors"
	"fmt"
	"log"
	// service "path/to/user/service" // 仮のインポートパス
	// postgres "path/to/user/postgres" // 仮のインポートパス
	// memory "path/to/user/memory" // 仮のインポートパス
)

// --- インターフェース定義 (利用側) ---
type Notifier interface {
	Notify(message string) error
}

// --- 依存するコンポーネント ---
type OrderProcessor struct {
	notifier Notifier // ★ インターフェース型のフィールド
}

// コンストラクタで依存性を注入
func NewOrderProcessor(notifier Notifier) *OrderProcessor {
	return &OrderProcessor{notifier: notifier}
}

func (p *OrderProcessor) ProcessOrder(orderID string) error {
	fmt.Printf("注文 %s を処理中...\n", orderID)
	// ... 注文処理ロジック ...

	// 処理完了を通知 (インターフェース経由で呼び出し)
	notification := fmt.Sprintf("注文 %s の処理が完了しました。", orderID)
	err := p.notifier.Notify(notification) // ★ 具体的な実装を知らない
	if err != nil {
		// 通知失敗時の処理 (例: ログ出力)
		log.Printf("通知失敗 (注文 %s): %v", orderID, err)
		// ここではエラーを返さないとする (通知は補助的な機能)
	}
	return nil
}

// --- 具体的な実装 ---

// EmailNotifier: メールで通知する実装
type EmailNotifier struct {
	AdminEmail string
}

func (n *EmailNotifier) Notify(message string) error {
	fmt.Printf("メール送信先 '%s': %s\n", n.AdminEmail, message)
	// 実際のメール送信処理...
	return nil // 成功したとする
}

// SlackNotifier: Slack で通知する実装
type SlackNotifier struct {
	WebhookURL string
}

func (n *SlackNotifier) Notify(message string) error {
	fmt.Printf("Slack 送信先 '%s': %s\n", n.WebhookURL, message)
	// 実際の Slack 送信処理...
	if message == "" { return errors.New("空のメッセージは送信できません") } // エラー例
	return nil
}

// --- 組み立て (main) ---
func main() {
	// --- EmailNotifier を注入 ---
	emailNotifier := &EmailNotifier{AdminEmail: "admin@example.com"}
	processor1 := NewOrderProcessor(emailNotifier) // インターフェースを満たす EmailNotifier を渡す
	processor1.ProcessOrder("Order-A1")

	fmt.Println("---")

	// --- SlackNotifier を注入 ---
	slackNotifier := &SlackNotifier{WebhookURL: "https://hooks.slack.com/..."}
	processor2 := NewOrderProcessor(slackNotifier) // インターフェースを満たす SlackNotifier を渡す
	processor2.ProcessOrder("Order-B2")

	// --- UserRepository の例 (コメントアウト) ---
	// // 本番環境では PostgresRepo を注入
	// dbRepo := postgres.NewPostgresRepo(...)
	// userService := service.NewUserService(dbRepo)
	// // userService を使った処理...

	// // テスト環境では InMemoryRepo を注入できる
	// // testRepo := memory.NewInMemoryRepo()
	// // testUserService := service.NewUserService(testRepo)
}

/* 実行結果:
注文 Order-A1 を処理中...
メール送信先 'admin@example.com': 注文 Order-A1 の処理が完了しました。
---
注文 Order-B2 を処理中...
Slack 送信先 'https://hooks.slack.com/...': 注文 Order-B2 の処理が完了しました。
*/
```

## 解説
```text
**依存性注入 (Dependency Injection, DI)** は、あるコンポーネント（例: `UserService`）が依存する別のコンポーネント（例: `UserRepository`）を、自身で生成するのではなく、**外部から与えられる（注入される）**ように設計する手法です。

Goでは、この依存関係を表現するために**インターフェース**を使うことが非常に効果的であり、ベストプラクティスとされています。

## なぜ DI にインターフェースを使うのか？

*   **疎結合 (Loose Coupling):** コンポーネントが具体的な実装（例: `PostgresUserRepository`）ではなく、抽象的なインターフェース (`UserRepository`) に依存することで、両者の間の結合度が低くなります。`UserRepository` インターフェースを満たすものであれば、将来的に別の実装（例: `MySQLUserRepository`, `InMemoryUserRepository`）に**簡単に差し替える**ことができます。
*   **テスト容易性 (Testability):** テスト時には、本番用の実装（例: 実際のデータベースにアクセスする `PostgresUserRepository`）の代わりに、テスト用の**モック実装 (Mock/Stub)** を注入することができます。これにより、外部依存なしにコンポーネント単体のロジックを簡単にテストできます。
*   **柔軟性と拡張性:** 新しいデータストア実装を追加する場合でも、インターフェースを満たしていれば、既存の `UserService` コードを変更する必要がありません。

## インターフェースを使った DI の実装パターン

1.  **依存される側の機能をインターフェースとして定義:** 依存されるコンポーネントが提供すべきメソッドをインターフェースとして定義します（通常は利用側で定義します）。
    ```go
    // user/service.go (利用側パッケージ)
    package service

    // User 型 (仮定義)
    type User struct { Name string }

    // UserRepository はユーザーデータの永続化を担当するインターフェース
    type UserRepository interface {
        FindByID(id string) (*User, error)
        Save(user *User) error
    }
    ```
2.  **依存する側のコンポーネントを定義:** 依存するコンポーネント（例: `UserService`）は、具体的な実装ではなく、**インターフェース型**のフィールドを持ちます。
    ```go
    // user/service.go
    type UserService struct {
        repo UserRepository // ★ インターフェース型のフィールドを持つ
    }
    ```
3.  **コンストラクタでインターフェースを受け取る:** 依存する側のコンストラクタ関数で、インターフェース型の引数を受け取り、それをフィールドに設定します。
    ```go
    // user/service.go
    func NewUserService(repo UserRepository) *UserService {
        return &UserService{repo: repo}
    }

    // UserService のメソッドはインターフェース経由で依存機能を利用
    func (s *UserService) GetUserName(id string) (string, error) {
        user, err := s.repo.FindByID(id) // ★ インターフェースのメソッドを呼び出す
        if err != nil {
            return "", err
        }
        return user.Name, nil
    }
    ```
4.  **具体的な実装を作成:** 依存される側の具体的な実装（例: `PostgresRepo`, `InMemoryRepo`）を作成し、インターフェース (`UserRepository`) が要求するメソッドを実装します。
    ```go
    // user/postgres/repo.go (実装側パッケージ)
    package postgres
    import "path/to/user/service" // service.User, service.UserRepository を使うため

    type PostgresRepo struct { /* ... DB接続など ... */ }
    func (r *PostgresRepo) FindByID(id string) (*service.User, error) { /* ... DBアクセス ... */; return nil, nil }
    func (r *PostgresRepo) Save(user *service.User) error { /* ... DBアクセス ... */; return nil }
    func NewPostgresRepo(/*...*/) *PostgresRepo { return &PostgresRepo{} } // 仮コンストラクタ

    // user/memory/repo.go (別の実装側パッケージ)
    package memory
    import "path/to/user/service"

    type InMemoryRepo struct { data map[string]*service.User }
    func (r *InMemoryRepo) FindByID(id string) (*service.User, error) { /* ... mapアクセス ... */; return nil, nil }
    func (r *InMemoryRepo) Save(user *service.User) error { /* ... mapアクセス ... */; return nil }
    func NewInMemoryRepo() *InMemoryRepo { return &InMemoryRepo{data: make(map[string]*service.User)} } // 仮コンストラクタ
    ```
5.  **組み立て (Wiring):** アプリケーションの初期化時など（例: `main` 関数）で、具体的な実装のインスタンスを生成し、それをコンストラクタに渡して依存関係を注入します。（上記「コード」セクションの `main` 関数参照）

**コード解説 (メイン例):**

*   `Notifier` インターフェースは `Notify` メソッドを定義します。
*   `OrderProcessor` は `Notifier` インターフェース型のフィールド `notifier` を持ちます。具体的な通知方法（メールかSlackか）を知りません。
*   `NewOrderProcessor` は `Notifier` を引数に取り、`OrderProcessor` を初期化します。
*   `EmailNotifier` と `SlackNotifier` は、それぞれ `Notifier` インターフェースを満たすように `Notify` メソッドを実装します。
*   `main` 関数では、`EmailNotifier` または `SlackNotifier` のインスタンスを作成し、それを `NewOrderProcessor` に渡しています。`OrderProcessor` は渡されたものがどちらの実装であるかを意識することなく、`notifier.Notify()` を呼び出すことができます。

このようにインターフェースを使って依存性を注入することで、コードの各部分が疎結合になり、テストや変更が容易になります。これは、Goでクリーンで保守性の高いコードを書くための重要なテクニックの一つです。