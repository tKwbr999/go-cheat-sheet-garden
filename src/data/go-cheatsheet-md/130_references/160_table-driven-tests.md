## タイトル
title: "リファレンス: テーブル駆動テスト (Table-Driven Tests)"
## タグ
tags: ["references", "testing", "go test", "table-driven", "t.Run", "サブテスト"]
Goのテストにおいて、同じ関数に対して複数の異なる入力と期待される出力でテストを行いたい場合、**テーブル駆動テスト (Table-Driven Tests)** というパターンが広く使われ、推奨されています。

これは、テストケース（入力値、期待される出力、テスト名など）をテーブル（通常は構造体のスライス）として定義し、ループを使って各テストケースを反復処理する書き方です。

## テーブル駆動テストの利点

*   **テストケースの追加・管理が容易:** 新しいテストケースを追加するには、テーブルに新しい要素を追加するだけで済みます。
*   **コードの重複削減:** テストの実行ロジック（関数の呼び出しと比較）はループ内に一度だけ記述すれば良いため、テストケースごとにコードをコピー＆ペーストする必要がありません。
*   **可読性の向上:** テストデータとテストロジックが分離され、どのようなケースをテストしているのかが分かりやすくなります。
*   **サブテスト (`t.Run`) との連携:** 各テストケースを `t.Run` を使ってサブテストとして実行することで、どのケースが失敗したかが明確になり、特定のサブテストだけを実行することも可能になります。

## テーブル駆動テストの構造

1.  **テストケース用構造体の定義:** 各テストケースの入力値、期待される出力、そしてテストケースを識別するための名前などを保持する構造体を定義します（無名構造体を使うことも多いです）。
2.  **テストデータの作成:** 定義した構造体のスライスを作成し、具体的なテストケースのデータを要素として格納します。
3.  **ループによる反復処理:** 作成したテストデータのスライスを `for` ループで反復処理します。
4.  **`t.Run` によるサブテストの実行:** ループ内で `t.Run(テストケース名, func(t *testing.T) { ... })` を呼び出します。
    *   第一引数には、テストケースを識別するためのユニークな名前（通常はテストケース構造体の名前フィールド）を渡します。
    *   第二引数には、実際のテストロジック（テスト対象関数の呼び出し、結果の比較、`t.Errorf`/`t.Fatalf` による失敗報告）を含む無名関数を渡します。
    *   **注意:** ループ変数をサブテストの無名関数内で直接使う場合は、クロージャの落とし穴を避けるために、ループ内で変数をコピーする必要があります（例: `tt := tt`）。(Go 1.22以降では不要になる場合があります)

## テストコード例: `Add` 関数のテーブル駆動テスト

前のセクションで使った `Add` 関数をテーブル駆動テストで書き直してみます。

**テストコード (`mathutil/add_test.go` - 例):**
```go
package mathutil_test

import (
	"fmt"
	"testing"

	"myproject/mathutil" // パスは例
)

func TestAdd_TableDriven(t *testing.T) {
	// 1. テストケース用構造体の定義 (無名構造体を使用)
	tests := []struct {
		name string // テストケース名
		a    int    // 入力 a
		b    int    // 入力 b
		want int    // 期待される出力
	}{
		// 2. テストデータの作成 (スライスリテラル)
		{name: "正の数同士", a: 2, b: 3, want: 5},
		{name: "負の数同士", a: -1, b: -2, want: -3},
		{name: "正と負の数", a: -5, b: 5, want: 0},
		{name: "ゼロを含む", a: 10, b: 0, want: 10},
		// 新しいテストケースはここに追加するだけ
		// {name: "大きな数", a: 1000000, b: 2000000, want: 3000000},
	}

	// 3. ループによる反復処理
	for _, tt := range tests {
		// ループ変数をサブテスト内で安全に使うためのコピー (Go 1.22 より前で推奨)
		tt := tt
		// Go 1.22 以降ではループ変数が各反復で新しく束縛されるため、このコピーは不要になる場合がある

		// 4. t.Run でサブテストを実行
		t.Run(tt.name, func(t *testing.T) {
			// サブテスト内でテスト対象関数を呼び出し
			got := mathutil.Add(tt.a, tt.b)
			// 結果を期待値と比較
			if got != tt.want {
				// 失敗した場合、サブテストのエラーとして報告
				t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}

/*
テスト実行コマンド: go test -v ./...

実行結果 (すべて成功する場合):
=== RUN   TestAdd_TableDriven
=== RUN   TestAdd_TableDriven/正の数同士
=== RUN   TestAdd_TableDriven/負の数同士
=== RUN   TestAdd_TableDriven/正と負の数
=== RUN   TestAdd_TableDriven/ゼロを含む
--- PASS: TestAdd_TableDriven (0.00s)
    --- PASS: TestAdd_TableDriven/正の数同士 (0.00s)
    --- PASS: TestAdd_TableDriven/負の数同士 (0.00s)
    --- PASS: TestAdd_TableDriven/正と負の数 (0.00s)
    --- PASS: TestAdd_TableDriven/ゼロを含む (0.00s)
PASS
ok  	myproject/mathutil	0.XXXs

実行結果 (例えば "正と負の数" ケースが失敗する場合):
=== RUN   TestAdd_TableDriven
=== RUN   TestAdd_TableDriven/正の数同士
=== RUN   TestAdd_TableDriven/負の数同士
=== RUN   TestAdd_TableDriven/正と負の数
    add_test.go:78: Add(-5, 5) = 1; want 0  <- 失敗したサブテストのエラーが表示される
=== RUN   TestAdd_TableDriven/ゼロを含む
--- FAIL: TestAdd_TableDriven (0.00s)
    --- PASS: TestAdd_TableDriven/正の数同士 (0.00s)
    --- PASS: TestAdd_TableDriven/負の数同士 (0.00s)
    --- FAIL: TestAdd_TableDriven/正と負の数 (0.00s) <- 失敗したサブテストが明確にわかる
    --- PASS: TestAdd_TableDriven/ゼロを含む (0.00s)
FAIL
exit status 1
FAIL	myproject/mathutil	0.XXXs
*/
```

**コード解説:**

*   `tests := []struct { ... } { ... }`: テストケースを定義するための無名構造体のスライスを作成し、各テストケースのデータ（名前、入力 `a`, `b`、期待値 `want`）をリテラルで初期化しています。
*   `for _, tt := range tests`: スライス `tests` の各要素 `tt` についてループします。
*   `t.Run(tt.name, func(t *testing.T) { ... })`: 各テストケースに対して `t.Run` を呼び出し、サブテストを実行します。
    *   `tt.name` がサブテストの名前として使われます。これにより、`go test -run TestAdd_TableDriven/正の数同士` のように特定のサブテストだけを実行したり、テスト結果でどのケースが失敗したかを特定したりするのが容易になります。
    *   サブテストの関数内 (`func(t *testing.T)`) では、ループ変数 `tt` のフィールド (`tt.a`, `tt.b`, `tt.want`) を使ってテスト対象関数を呼び出し、結果を検証します。
    *   サブテスト内で `t.Errorf` や `t.Fatalf` を使うと、そのサブテストが失敗としてマークされますが、他のサブテストの実行には影響しません（`t.Fatalf` はそのサブテスト関数を終了させるだけです）。

テーブル駆動テストは、複数の入力パターンや境界値に対するテストを体系的に記述するための非常に効果的な方法であり、Goのテストコードで広く採用されています。