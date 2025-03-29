## タイトル
title: "リファレンス: テストのためのモック (Mocking)"
## タグ
tags: ["references", "testing", "mocking", "stub", "fake", "dependency injection", "interfaces", "テスト容易性"]
ユニットテストを行う際、テスト対象のコードが依存している外部コンポーネント（データベース、外部API、ファイルシステムなど）があると、テストの実行が遅くなったり、外部の状態に依存して不安定になったり、テストのセットアップが複雑になったりします。

このような問題を解決するために、テスト時には外部依存性を**モック (Mock)** や**スタブ (Stub)**、**フェイク (Fake)** といったテスト用の代役オブジェクトに置き換える手法がよく使われます。Goでは、**インターフェース**と**依存性注入 (DI)** を組み合わせることで、これを容易に実現できます。

## モックとは？ なぜ使うのか？

*   **モック/スタブ/フェイク:** テスト対象が依存するコンポーネントの代わりとして振る舞うオブジェクト。テストに必要な最小限の機能（特定のメソッド呼び出しに対して決められた値を返す、呼び出されたことを記録するなど）を提供します。（用語の厳密な使い分けは文脈によりますが、ここでは広く「モック」と呼びます。）
*   **目的:**
    *   **外部依存性の排除:** データベースやネットワーク接続が不要になり、テストが高速かつ安定します。
    *   **テスト対象の分離:** テスト対象コンポーネントのロジックのみに集中してテストできます。
    *   **特定の状況のシミュレーション:** 依存コンポーネントがエラーを返す場合や、特定のデータを返す場合など、通常では再現しにくい状況を簡単に作り出すことができます。

## インターフェースと DI によるモックの実現

**「ベストプラクティス: 依存性注入 (DI) にインターフェースを使う」** (`130_references/110_best-practice-use-interfaces-for-di.md`) で説明したように、依存関係をインターフェースで定義し、外部から注入する設計にしておくことが鍵となります。

1.  **インターフェース定義:** 依存される側の機能（例: データストア）をインターフェース (`UserStore`) として定義します。
2.  **依存する側の実装:** テスト対象のコンポーネント (`UserHandler`) は、具体的な実装ではなく、このインターフェース (`UserStore`) に依存するようにします。
3.  **モック実装の作成:** テストコード (`_test.go` ファイル内) で、依存インターフェース (`UserStore`) を満たす**モック用の構造体** (`mockUserStore`) を定義し、テストに必要な振る舞い（例: 特定のIDに対して特定のユーザーを返す）を実装します。
4.  **テスト実行:** テスト関数内でモックのインスタンスを作成し、それをテスト対象コンポーネントのコンストラクタなどに**注入**してテストを実行します。

## コード例: `UserHandler` のテスト

`UserStore` インターフェースに依存する `UserHandler` をテストする例です。

**テスト対象のコード (`handler/user_handler.go` - 例):**
```go
// テスト対象のコード (例: handler/user_handler.go)
package handler

import (
	"errors"
	"fmt"
	// "myproject/model" // 仮のモデルパッケージ
)

// User モデル (仮)
type User struct { ID, Name string }

// UserStore インターフェース (依存される側)
type UserStore interface {
	GetUser(id string) (*User, error)
}

// UserHandler (テスト対象、UserStore に依存)
type UserHandler struct {
	store UserStore // ★ インターフェースに依存
}

// コンストラクタ
func NewUserHandler(store UserStore) *UserHandler {
	return &UserHandler{store: store}
}

// GetUser ハンドラメソッド (例)
func (h *UserHandler) GetUser(id string) (*User, error) {
	if id == "" {
		return nil, errors.New("ID が空です")
	}
	user, err := h.store.GetUser(id) // ★ インターフェース経由で呼び出し
	if err != nil {
		// エラーをラップするなど
		return nil, fmt.Errorf("ユーザー取得失敗: %w", err)
	}
	return user, nil
}
```

## 解説
```text
ユニットテストを行う際、テスト対象のコードが依存している外部コンポーネント（データベース、外部API、ファイルシステムなど）があると、テストの実行が遅くなったり、外部の状態に依存して不安定になったり、テストのセットアップが複雑になったりします。

このような問題を解決するために、テスト時には外部依存性を**モック (Mock)** や**スタブ (Stub)**、**フェイク (Fake)** といったテスト用の代役オブジェクトに置き換える手法がよく使われます。Goでは、**インターフェース**と**依存性注入 (DI)** を組み合わせることで、これを容易に実現できます。

## モックとは？ なぜ使うのか？

*   **モック/スタブ/フェイク:** テスト対象が依存するコンポーネントの代わりとして振る舞うオブジェクト。テストに必要な最小限の機能（特定のメソッド呼び出しに対して決められた値を返す、呼び出されたことを記録するなど）を提供します。（用語の厳密な使い分けは文脈によりますが、ここでは広く「モック」と呼びます。）
*   **目的:**
    *   **外部依存性の排除:** データベースやネットワーク接続が不要になり、テストが高速かつ安定します。
    *   **テスト対象の分離:** テスト対象コンポーネントのロジックのみに集中してテストできます。
    *   **特定の状況のシミュレーション:** 依存コンポーネントがエラーを返す場合や、特定のデータを返す場合など、通常では再現しにくい状況を簡単に作り出すことができます。

## インターフェースと DI によるモックの実現

**「ベストプラクティス: 依存性注入 (DI) にインターフェースを使う」** (`130_references/110_best-practice-use-interfaces-for-di.md`) で説明したように、依存関係をインターフェースで定義し、外部から注入する設計にしておくことが鍵となります。

1.  **インターフェース定義:** 依存される側の機能（例: データストア）をインターフェース (`UserStore`) として定義します。
2.  **依存する側の実装:** テスト対象のコンポーネント (`UserHandler`) は、具体的な実装ではなく、このインターフェース (`UserStore`) に依存するようにします。
3.  **モック実装の作成:** テストコード (`_test.go` ファイル内) で、依存インターフェース (`UserStore`) を満たす**モック用の構造体** (`mockUserStore`) を定義し、テストに必要な振る舞い（例: 特定のIDに対して特定のユーザーを返す）を実装します。
4.  **テスト実行:** テスト関数内でモックのインスタンスを作成し、それをテスト対象コンポーネントのコンストラクタなどに**注入**してテストを実行します。

## テストコード例: `UserHandler` のテスト

`UserStore` インターフェースに依存する `UserHandler` をテストする例です。

**テストコード (`handler/user_handler_test.go` - 例):**
```go
package handler_test // _test パッケージ

import (
	"errors"
	"fmt"
	"testing"

	"myproject/handler" // テスト対象パッケージ
)

// --- UserStore インターフェースのモック実装 ---
type mockUserStore struct {
	// テストケースごとに振る舞いを変えられるようにフィールドを持つことも多い
	users map[string]*handler.User // テストデータを保持するマップ
	err   error                    // 返すべきエラーを保持
}

// GetUser メソッドを実装 (UserStore インターフェースを満たす)
func (m *mockUserStore) GetUser(id string) (*handler.User, error) {
	fmt.Printf("  (mockUserStore.GetUser が ID '%s' で呼び出されました)\n", id)
	if m.err != nil {
		return nil, m.err // 設定されたエラーを返す
	}
	user, ok := m.users[id]
	if !ok {
		return nil, errors.New("モック: ユーザーが見つかりません") // モック用のエラー
	}
	return user, nil
}

// --- テスト関数 ---
func TestUserHandler_GetUser(t *testing.T) {
	// --- テストケース 1: ユーザーが見つかる場合 ---
	t.Run("ユーザーが見つかる場合", func(t *testing.T) {
		// 1. モックを設定
		mockStore := &mockUserStore{
			users: map[string]*handler.User{
				"user123": {ID: "user123", Name: "Test Taro"},
			},
		}
		// 2. モックを注入してテスト対象を作成
		h := handler.NewUserHandler(mockStore)

		// 3. テスト対象メソッドを実行
		user, err := h.GetUser("user123")

		// 4. 結果を検証
		if err != nil {
			t.Fatalf("予期せぬエラー: %v", err)
		}
		if user == nil {
			t.Fatal("ユーザーが nil です")
		}
		if user.Name != "Test Taro" {
			t.Errorf("期待した名前 'Test Taro', 得られた名前 '%s'", user.Name)
		}
	})

	// --- テストケース 2: ユーザーが見つからない場合 ---
	t.Run("ユーザーが見つからない場合", func(t *testing.T) {
		// 1. モックを設定 (空のマップ)
		mockStore := &mockUserStore{users: make(map[string]*handler.User)}
		// 2. モックを注入
		h := handler.NewUserHandler(mockStore)
		// 3. 実行
		_, err := h.GetUser("unknown")
		// 4. 検証 (エラーが発生し、特定のエラーメッセージか確認)
		if err == nil {
			t.Fatal("エラーが発生しませんでした")
		}
		// エラーメッセージの内容を確認 (例)
		// if !strings.Contains(err.Error(), "ユーザー取得失敗") { ... }
		fmt.Printf("  (期待されるエラー: %v)\n", err) // ログ出力例
	})

	// --- テストケース 3: ストアがエラーを返す場合 ---
	t.Run("ストアがエラーを返す場合", func(t *testing.T) {
		// 1. モックを設定 (エラーを返すように)
		mockStore := &mockUserStore{err: errors.New("DB接続エラー")}
		// 2. モックを注入
		h := handler.NewUserHandler(mockStore)
		// 3. 実行
		_, err := h.GetUser("anyID")
		// 4. 検証 (エラーが発生し、特定のエラーメッセージか確認)
		if err == nil {
			t.Fatal("エラーが発生しませんでした")
		}
		if !errors.Is(err, mockStore.err) { // errors.Is でラップされたか確認
			t.Errorf("期待したエラー '%v' がラップされていません: %v", mockStore.err, err)
		}
		fmt.Printf("  (期待されるエラー: %v)\n", err) // ログ出力例
	})
}

/*
テスト実行コマンド: go test -v ./...

実行結果の例:
=== RUN   TestUserHandler_GetUser
=== RUN   TestUserHandler_GetUser/ユーザーが見つかる場合
  (mockUserStore.GetUser が ID 'user123' で呼び出されました)
=== RUN   TestUserHandler_GetUser/ユーザーが見つからない場合
  (mockUserStore.GetUser が ID 'unknown' で呼び出されました)
  (期待されるエラー: ユーザー取得失敗: モック: ユーザーが見つかりません)
=== RUN   TestUserHandler_GetUser/ストアがエラーを返す場合
  (mockUserStore.GetUser が ID 'anyID' で呼び出されました)
  (期待されるエラー: ユーザー取得失敗: DB接続エラー)
--- PASS: TestUserHandler_GetUser (0.00s)
    --- PASS: TestUserHandler_GetUser/ユーザーが見つかる場合 (0.00s)
    --- PASS: TestUserHandler_GetUser/ユーザーが見つからない場合 (0.00s)
    --- PASS: TestUserHandler_GetUser/ストアがエラーを返す場合 (0.00s)
PASS
ok  	myproject/handler	0.XXXs
*/
```

**コード解説:**

*   `mockUserStore` は `UserStore` インターフェースを満たすように `GetUser` メソッドを実装しています。内部のマップ `users` やエラー `err` を使って、テストケースごとに振る舞いを制御できます。
*   `TestUserHandler_GetUser` 内の各サブテスト (`t.Run`) で、テストシナリオに応じた `mockUserStore` を作成します。
*   `handler.NewUserHandler(mockStore)` で、作成したモックを `UserHandler` に注入します。
*   `h.GetUser(...)` を呼び出すと、実際には `mockUserStore` の `GetUser` が呼び出されます。
*   テストの最後に、`GetUser` の戻り値（ユーザー情報やエラー）が期待通りであるかを `t.Errorf` や `t.Fatalf`, `errors.Is` などを使って検証します。

インターフェースと依存性注入を活用することで、外部依存性を排除したクリーンなユニットテストを容易に記述できるようになります。これは、Goでテスト容易性の高いコードを書くための重要なテクニックです。