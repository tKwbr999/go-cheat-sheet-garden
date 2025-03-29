## タイトル
title: "リファレンス: 基本的なテスト関数"
## タグ
tags: ["references", "testing", "go test", "TestXxx", "t.Errorf", "t.Fatalf"]
Go言語は、標準で**テスト**の仕組みを言語とツールチェーンに組み込んでいます。これにより、コードの品質を維持し、リグレッション（意図しない変更によるバグの再発）を防ぐことが容易になります。

## テストファイルの規約

*   テストコードは、テスト対象のコードと同じパッケージディレクトリ内に置きます。
*   テストコードを含むファイル名は、**`_test.go`** というサフィックスで終わる必要があります（例: `mypackage_test.go`, `utils_test.go`）。
*   テストファイル内のパッケージ名は、通常2つの選択肢があります。
    *   **`package mypackage`**: テスト対象と同じパッケージ名にします。これにより、テストコードからパッケージ内の**非公開**な関数や変数にもアクセスできます（ユニットテスト向け）。
    *   **`package mypackage_test`**: テスト対象のパッケージ名に `_test` サフィックスを付けた、**別のパッケージ**として扱います。この場合、テストコードはテスト対象パッケージの**公開**された API のみをテストすることになります（インテグレーションテストやブラックボックステストに近い）。こちらが推奨されることが多いです。

## テスト関数の規約

*   テスト関数は `testing` パッケージをインポート (`import "testing"`) します。
*   関数名は **`Test`** で始まり、その後に続く名前の最初の文字は**大文字**である必要があります（例: `TestMyFunction`, `TestCalculateTotal`）。
*   関数は **`*testing.T` 型の引数を一つだけ**受け取ります。この `t` パラメータは、テストの失敗を報告したり、ログを出力したりするためのメソッドを提供します。
*   戻り値はありません。

**シグネチャ:** `func TestXxx(t *testing.T) { ... }`

## テストの失敗を報告する

`*testing.T` が提供する主なメソッドを使って、テストが失敗したことを報告します。

*   **`t.Errorf(format string, args ...any)`**: `fmt.Sprintf` と同じようにメッセージをフォーマットし、それを**エラーとして記録**します。テストの実行は**継続**されます。
*   **`t.Fatalf(format string, args ...any)`**: `Errorf` と同様にメッセージをエラーとして記録しますが、その後すぐに現在のテスト関数**を終了**させます（`runtime.Goexit()` を呼び出します）。同じテスト関数内の後続のチェックは実行されません。
*   **`t.Error(args ...any)`**: `fmt.Sprint` と同じように引数をフォーマットし、エラーとして記録します（`Errorf` の簡易版）。テストは継続されます。
*   **`t.Fatal(args ...any)`**: `Error` と同様に引数をフォーマットし、エラーとして記録した後、テスト関数を終了させます（`Fatalf` の簡易版）。
*   **`t.Logf(format string, args ...any)` / `t.Log(args ...any)`**: テストに関する情報をログとして記録します。テストが失敗した場合や `-v` フラグ付きで実行された場合に表示されます。

## テストコード例

簡単な足し算関数 `Add` をテストする例です。

**テストコード (`mathutil/add_test.go` - 例):**
```go
// テスト対象とは別のパッケージとしてテスト (公開 API のみをテスト)
package mathutil_test

import (
	"testing" // testing パッケージをインポート

	"myproject/mathutil" // テスト対象のパッケージをインポート (パスは例)
)

// TestAdd 関数のテスト
func TestAdd(t *testing.T) {
	// --- テストケース 1: 基本的な加算 ---
	got := mathutil.Add(2, 3) // テスト対象関数を呼び出し
	want := 5                 // 期待される結果

	// 結果が期待通りかチェック
	if got != want {
		// ★ 失敗した場合、t.Errorf でエラーメッセージを記録 ★
		//    テストはここで終了せず、後続のチェックも実行される
		t.Errorf("Add(2, 3) = %d; want %d", got, want)
	}

	// --- テストケース 2: 負の数を含む加算 ---
	got = mathutil.Add(-1, 5)
	want = 4
	if got != want {
		// ★ 失敗した場合、t.Fatalf でエラーメッセージを記録し、テスト関数を終了 ★
		//    もしここで失敗したら、これ以降の t.Log などは実行されない
		t.Fatalf("Add(-1, 5) = %d; want %d", got, want)
	}

	// --- テストケース 3: ゼロを含む加算 ---
	got = mathutil.Add(0, 0)
	want = 0
	if got != want {
		t.Errorf("Add(0, 0) = %d; want %d", got, want)
	}

	// テストが成功した場合のログ (通常は不要だが、デバッグ用に使うことがある)
	t.Log("TestAdd は正常に完了しました (すべてのケースがパスした場合)")
}

// 別のテスト関数
func TestAdd_Zero(t *testing.T) {
	if mathutil.Add(10, 0) != 10 {
		t.Error("10 + 0 should be 10")
	}
}

/*
テスト実行コマンド: go test ./... または go test myproject/mathutil

実行結果 (すべて成功する場合):
ok  	myproject/mathutil	0.XXXs

実行結果 (-v フラグ付き、すべて成功する場合):
=== RUN   TestAdd
    add_test.go:90: TestAdd は正常に完了しました (すべてのケースがパスした場合)
--- PASS: TestAdd (0.00s)
=== RUN   TestAdd_Zero
--- PASS: TestAdd_Zero (0.00s)
PASS
ok  	myproject/mathutil	0.XXXs

実行結果 (テストケース1が失敗する場合):
=== RUN   TestAdd
    add_test.go:70: Add(2, 3) = 6; want 5  <- Errorf によるエラー出力
    add_test.go:90: TestAdd は正常に完了しました (すべてのケースがパスした場合)
--- FAIL: TestAdd (0.00s)
=== RUN   TestAdd_Zero
--- PASS: TestAdd_Zero (0.00s)
FAIL
exit status 1
FAIL	myproject/mathutil	0.XXXs
*/
```

**コード解説:**

*   ファイル名は `add_test.go` とし、パッケージ名は `mathutil_test` としています。
*   `import "testing"` とテスト対象の `myproject/mathutil` をインポートします。
*   `func TestAdd(t *testing.T)`: テスト関数を定義します。
*   関数内でテスト対象の `mathutil.Add` を呼び出し、その結果 `got` と期待値 `want` を比較します。
*   `if got != want { t.Errorf(...) }`: 結果が異なる場合は `t.Errorf` でエラーメッセージを記録します。テストは続行されます。
*   `t.Fatalf` はエラーを記録した後、テスト関数を即座に終了させたい場合に使います。
*   `t.Log` はテストに関する補足情報を出力したい場合に使います（通常、テスト成功時は表示されません）。

`go test` コマンドを実行すると、`_test.go` ファイル内の `TestXxx` 関数が自動的に実行され、結果（PASS または FAIL）が表示されます。テストを書くことは、コードの品質を保証し、将来の変更に対する信頼性を高める上で非常に重要です。