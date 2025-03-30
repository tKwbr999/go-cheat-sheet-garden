## タイトル
title: Example 関数 (テスト可能なドキュメント)

## タグ
tags: ["references", "testing", "example", "godoc", "documentation", "go test"]

## コード
```go
package examples_test // 通常は _test パッケージ

import (
	"fmt"
	// "myproject/mypackage" // 例として使うパッケージ (仮)
)

// パッケージ全体の簡単な使用例
func Example() {
	fmt.Println("これはパッケージレベルの Example です。")
	// Output: これはパッケージレベルの Example です。
}

// Add 関数の使用例
func ExampleAdd() {
	// sum := mypackage.Add(1, 2) // 実際にはテスト対象の関数を呼び出す
	sum := 1 + 2 // 簡単のため直接計算
	fmt.Println(sum)
	// Output: 3
}

// 複数の出力がある例
func ExampleMultipleOutput() {
	fmt.Println("Line 1")
	fmt.Println("Line 2")
	// Output:
	// Line 1
	// Line 2
}

// 出力がない (ドキュメント用のみ) 例
func ExampleNoOutput() {
	// この関数は go test では実行されるが、出力の検証は行われない
	// ドキュメントにはコード例として表示される
	fmt.Println("この出力は検証されません。")
}

// サフィックス付きの例 (同じ関数に対する別の例)
func ExampleAdd_second() {
	sum := 10 + (-5)
	fmt.Println(sum)
	// Output: 5
}

/*
テスト実行コマンド: go test . または go test -v .

実行結果 (すべて成功する場合):
PASS
ok  	myproject/examples	0.XXXs

実行結果 (ExampleAdd の Output が間違っている場合、例: // Output: 4):
--- FAIL: ExampleAdd (0.00s)
got:
3
want:
4
FAIL
exit status 1
FAIL	myproject/examples	0.XXXs
*/
```

## 解説
```text
Goのテストファイル (`_test.go`) には、`TestXxx` (テスト) や `BenchmarkXxx` (ベンチマーク) に加えて、**`ExampleXxx`** という形式の**Example 関数**を書くことができます。

Example 関数は、主に以下の2つの目的で使われます。

1.  **ドキュメントとしてのコード例:** `go doc` コマンドや `pkg.go.dev` で生成されるドキュメントに、関数の**具体的な使い方を示すサンプルコード**として表示されます。これにより、パッケージの利用者は API の使い方をより簡単に理解できます。
2.  **テストとしての動作検証:** Example 関数内に書かれたコードが実行され、その**標準出力**が関数内の特別なコメント `// Output:` の後に書かれた内容と一致するかどうかが `go test` によって検証されます。これにより、コード例が常に正しく動作することを保証できます。

## Example 関数の規約

*   テスト関数と同様に **`_test.go`** ファイル内に記述します。
*   関数名は **`Example`** で始まり、その後に続く名前の最初の文字は**大文字**である必要があります。
    *   パッケージ全体の例: `func Example() { ... }`
    *   特定の関数 `F` の例: `func ExampleF() { ... }`
    *   特定の型 `T` の例: `func ExampleT() { ... }`
    *   型 `T` のメソッド `M` の例: `func ExampleT_M() { ... }`
    *   区別のためサフィックスを付けることも可能: `func ExampleF_suffix() { ... }`
*   関数は**引数を取らず、戻り値もありません**。
*   **出力の検証:**
    *   関数の最後に **`// Output:`** という形式のコメント（`//` と `Output:` の間にスペースは入れない）を記述し、その**次の行から**、関数が標準出力 (stdout) に出力すると期待される内容を記述します。
    *   `go test` は Example 関数を実行し、実際の標準出力と `// Output:` コメント以下の内容を比較します。一致すればテストは PASS、一致しなければ FAIL となります。
    *   出力の順序も重要です。
    *   `// Output:` コメントがない場合、Example 関数はドキュメント生成のためだけにコンパイルされますが、テストとしては実行・検証されません。
    *   出力が順不同でも良い場合は `// Unordered output:` を使いますが、一般的ではありません。

**コード解説:**

*   `func Example()`, `func ExampleAdd()`, `func ExampleMultipleOutput()`, `func ExampleAdd_second()`: Example 関数の命名規則に従っています。
*   `// Output: ...`: 各 Example 関数の最後に、期待される標準出力を記述しています。`go test` は、関数実行時の実際の標準出力とこのコメントの内容を比較します。
*   `ExampleMultipleOutput`: 複数行の出力も、コメント内で改行して記述します。
*   `ExampleNoOutput`: `// Output:` コメントがないため、`go test` はこの関数の出力を検証しませんが、`go doc` ではコード例として表示されます。

Example 関数は、パッケージの利用者に具体的な使い方を示すための優れたドキュメントとなると同時に、そのコード例が常に正しく動作することを保証するためのテストとしても機能します。公開する API には、分かりやすい Example 関数を提供することが推奨されます。