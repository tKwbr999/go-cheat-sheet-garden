---
title: "Context パッケージ: Context のテスト (モックは通常不要)"
tags: ["context", "concurrency", "testing", "mocking", "WithCancel", "WithTimeout"]
---

`context.Context` を受け取る関数をテストする際、「Context をモック（偽物や代役を用意）する必要があるのでは？」と考えるかもしれません。しかし、**通常、`context.Context` 自体をモックする必要はありませんし、推奨もされません。**

## なぜ Context のモックは通常不要か？

Goの `context` パッケージは、テストで扱いやすいように設計されています。

*   **タイムアウト/デッドラインのテスト:** `context.WithTimeout` や `context.WithDeadline` を使えば、テストコード内で簡単に時間制限付きの Context を生成でき、テスト対象関数が時間制限に正しく反応するかを確認できます。（`100_context/170_testing-with-timeout-context.md` 参照）
*   **キャンセルのテスト:** `context.WithCancel` を使えば、キャンセル可能な Context と `cancel` 関数を生成できます。テストコードから任意のタイミングで `cancel()` を呼び出すことで、テスト対象関数が明示的なキャンセルに正しく反応するかを確認できます。（`100_context/180_testing-with-cancellation-context.md` 参照）
*   **値のテスト:** `context.WithValue` を使えば、テストに必要な値を設定した Context を簡単に生成できます。

**テストの焦点:**

Context を使う関数のテストで重要なのは、多くの場合、**Context 自体の内部実装をテストすることではなく**、テスト対象の関数が **Context からのシグナル（キャンセル、タイムアウト）に正しく応答するか**、あるいは **Context を適切に下位の関数に伝播させているか**、**Context から期待される値を正しく取得・利用しているか**、といった点です。これらは標準の Context 生成関数を使って十分にテストできます。

**依存関係のモック:**

もしテスト対象の関数が、Context を使って外部サービス（データベース、APIなど）と通信する場合、Context をモックする代わりに、その**外部サービスへの依存部分をインターフェース化し、テスト時にはそのインターフェースのモック実装を使用する**のが一般的です。このモック実装が Context のキャンセルをチェックするように作れば、テスト対象関数が Context を正しく扱っているかを検証できます。

## Context モックの例（参考: 通常は不要）

以下に示すのは、`context.Context` インターフェースを実装する独自の型を作成し、`Done()` チャネルや `Err()` の動作を制御する例です。これは非常に稀なケース（例えば、Context の特殊な振る舞いをシミュレートしたい場合など）を除き、**通常は必要ありません**。標準の `context.WithCancel` などを使う方がはるかにシンプルです。

```go title="Context モックの実装例 (参考)"
package main

import (
	"context"
	"errors"
	"fmt"
	"testing" // testing パッケージが必要
	"time"
)

// --- Context モックの実装 (通常は不要) ---
type contextMock struct {
	context.Context        // 標準 Context を埋め込む (Value など他のメソッドのため)
	doneChannel chan struct{} // 独自の Done チャネル
}

// モックとキャンセル関数を作成するヘルパー
func newContextMock() (*contextMock, context.CancelFunc) {
	done := make(chan struct{})
	mock := &contextMock{
		Context:     context.Background(), // ベースとして Background を埋め込む
		doneChannel: done,
	}
	// close(done) を実行する関数を CancelFunc として返す
	cancel := func() {
		// 既にクローズされているかチェック (冪等性のため)
		select {
		case <-done:
			return // 既にクローズ済み
		default:
			close(done) // チャネルをクローズしてキャンセルを通知
		}
	}
	return mock, cancel
}

// Done() メソッドをオーバーライド
func (c *contextMock) Done() <-chan struct{} {
	return c.doneChannel // 独自のチャネルを返す
}

// Err() メソッドをオーバーライド
func (c *contextMock) Err() error {
	select {
	case <-c.doneChannel: // Done チャネルがクローズされていれば
		return context.Canceled // Canceled エラーを返す (例)
	default: // まだクローズされていなければ
		return nil
	}
}

// --- テスト対象の関数 (例) ---
func functionThatUsesContext(ctx context.Context) error {
	fmt.Println("  (テスト対象関数: 開始)")
	select {
	case <-time.After(1 * time.Second): // 時間のかかる処理
		fmt.Println("  (テスト対象関数: 正常完了)")
		return nil
	case <-ctx.Done(): // Context のキャンセルを待つ
		err := ctx.Err()
		fmt.Printf("  (テスト対象関数: キャンセル検知: %v)\n", err)
		return err
	}
}

// --- モックを使ったテスト (参考) ---
func TestWithMockContext(t *testing.T) {
	fmt.Println("--- TestWithMockContext 開始 ---")
	// モック Context とキャンセル関数を作成
	mockCtx, cancelMock := newContextMock()
	// defer cancelMock() // このテストでは明示的に呼ぶので defer は不要かも

	errChan := make(chan error, 1)
	go func() {
		// テスト対象関数にモック Context を渡す
		errChan <- functionThatUsesContext(mockCtx)
	}()

	// 少し待ってからモックのキャンセル関数を呼び出す
	time.Sleep(50 * time.Millisecond)
	fmt.Println("テスト: cancelMock() を呼び出し")
	cancelMock() // これにより mockCtx.Done() がクローズされる

	// 結果を検証
	select {
	case err := <-errChan:
		if !errors.Is(err, context.Canceled) {
			t.Errorf("期待したエラーは context.Canceled ですが、実際は %v", err)
		} else {
			fmt.Println("テスト: 期待通り context.Canceled を受け取りました。")
		}
	case <-time.After(2 * time.Second): // テスト自体のタイムアウト
		t.Errorf("テストがタイムアウトしました。")
	}
	fmt.Println("--- TestWithMockContext 終了 ---")
}

/*
テスト実行コマンド: go test -v .

実行結果の例:
=== RUN   TestWithMockContext
--- TestWithMockContext 開始 ---
  (テスト対象関数: 開始)
テスト: cancelMock() を呼び出し
  (テスト対象関数: キャンセル検知: context canceled)
テスト: 期待通り context.Canceled を受け取りました。
--- TestWithMockContext 終了 ---
--- PASS: TestWithMockContext (0.05s)
PASS
ok  	myproject	0.XXXs
*/
```

**結論:**

`context.Context` を受け取る関数のテストでは、**標準パッケージが提供する `context.WithCancel`, `context.WithTimeout`, `context.WithValue` を使ってテストシナリオに応じた Context を生成するのが、最もシンプルで推奨される方法です。** Context 自体のモックは、通常は必要ありません。