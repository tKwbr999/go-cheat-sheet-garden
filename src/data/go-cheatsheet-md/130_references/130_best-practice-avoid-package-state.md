---
title: "ベストプラクティス: パッケージレベルの状態を避ける"
tags: ["references", "best practice", "package state", "global variables", "dependency injection", "struct"]
---

Goのコードをクリーンで保守しやすく、テストしやすく保つための重要なベストプラクティスの一つが、**パッケージレベルの変数（特に可変な状態を持つもの）を可能な限り避ける**ことです。

パッケージレベルの変数の問題点については、**「パッケージ: パッケージ変数」** (`070_packages/080_package-variables.md`) で既に説明しました。

## なぜパッケージレベルの状態を避けるべきか？ (再確認)

*   **隠れた依存関係:** パッケージレベルの変数に依存する関数は、その依存関係が関数のシグネチャに明示されません。これにより、コードの理解やテストが難しくなります。
*   **副作用と予測不能性:** どの関数がいつパッケージ変数を変更するかわかりにくく、予期しない副作用や、実行順序によって結果が変わるなどの問題を引き起こしやすくなります。
*   **並行処理の問題:** 複数の Goroutine が同時にパッケージ変数にアクセスすると、競合状態が発生するリスクが高まります。保護するためには Mutex が必要になり、コードが複雑化します。
*   **テストの難しさ:** パッケージ変数の状態に依存する関数は、テストごとに状態を初期化したり、特定の状態を作り出したりするのが難しく、テストの独立性が損なわれます。

## 推奨されるアプローチ: 構造体と依存性注入

パッケージレベルの変数（グローバル変数）に依存関係（データベース接続、設定、ロガーなど）を持たせる代わりに、これらの依存関係を必要とするコンポーネントを**構造体**として定義し、その**フィールド**として依存関係を持たせます。そして、コンストラクタ関数などを通じて**外部から依存性を注入 (Dependency Injection)** します。

```go title="パッケージ変数 vs 構造体フィールド"
package main

import (
	"database/sql"
	"fmt"
	"log"
	// "myproject/db" // ダミー
)

// --- 悪い例: パッケージレベルの変数 ---
var globalDB *sql.DB // グローバルなDB接続 (非推奨)

func InitGlobalDB(dataSourceName string) {
	var err error
	// globalDB, err = sql.Open("postgres", dataSourceName) // 実際のコード
	globalDB, err = openDummyDB() // ダミー
	if err != nil {
		log.Fatal(err)
	}
}

// globalDB に暗黙的に依存する関数
func GetUserNameByID(userID int) (string, error) {
	if globalDB == nil {
		return "", fmt.Errorf("データベースが初期化されていません")
	}
	// return globalDB.QueryRow(...).Scan(...) // globalDB を直接使う
	fmt.Printf("  (GetUserNameByID: globalDB を使って ID %d を検索)\n", userID)
	return fmt.Sprintf("User-%d", userID), nil // ダミー
}


// --- 良い例: 構造体と依存性注入 ---
type UserService struct {
	db *sql.DB // ★ 依存関係をフィールドとして持つ ★
}

// コンストラクタで依存性を注入
func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// メソッドは構造体のフィールド (db) を使う
func (s *UserService) GetUserNameByID(userID int) (string, error) {
	if s.db == nil { // コンストラクタで nil チェックする方が良い場合も
		return "", fmt.Errorf("UserService の db が nil です")
	}
	// return s.db.QueryRow(...).Scan(...) // フィールド db を使う
	fmt.Printf("  (UserService.GetUserNameByID: s.db を使って ID %d を検索)\n", userID)
	return fmt.Sprintf("User-%d", userID), nil // ダミー
}


func main() {
	// --- 悪い例の使い方 ---
	// InitGlobalDB("user=pqgotest dbname=pqgotest sslmode=verify-full") // 初期化が必要
	// name1, err1 := GetUserNameByID(1) // グローバル変数に依存
	// fmt.Printf("悪い例: %s, %v\n", name1, err1)

	// --- 良い例の使い方 ---
	// 依存関係 (DB接続) を main などで初期化
	// dbConn, err := sql.Open("postgres", "...")
	dbConn, err := openDummyDB() // ダミー
	if err != nil { log.Fatal(err) }
	defer dbConn.Close()

	// 依存性を注入して UserService を作成
	userService := NewUserService(dbConn)

	// UserService のメソッドを呼び出す
	name2, err2 := userService.GetUserNameByID(2)
	fmt.Printf("良い例: %s, %v\n", name2, err2)
}

// ダミー関数
func openDummyDB() (*sql.DB, error) { return &sql.DB{}, nil }

/* 実行結果:
良い例: User-2, <nil>
*/
```

**コード解説:**

*   **悪い例:** `globalDB` がパッケージレベルで宣言されており、`GetUserNameByID` 関数はこのグローバル変数に暗黙的に依存しています。テストや並行処理が難しくなります。
*   **良い例:** `UserService` 構造体が `db *sql.DB` フィールドを持ちます。`NewUserService` コンストラクタで `*sql.DB` のインスタンスを受け取り（注入され）、`GetUserNameByID` メソッドはそのフィールド `s.db` を使って処理を行います。依存関係が明確になり、テスト時にはモックの `*sql.DB` (またはインターフェース) を注入することも容易になります。

パッケージレベルの**定数 (`const`)** は値が不変なので問題ありませんが、**可変な状態**を持つパッケージレベルの変数は、コードの複雑さを増し、バグの原因となりやすいため、可能な限り避け、構造体と依存性注入のアプローチを検討しましょう。