## タイトル
title: パッケージ: エクスポートされる識別子 vs エクスポートされない識別子

## タグ
tags: ["packages", "package", "エクスポート", "公開", "非公開", "命名規則", "大文字", "小文字"]

## コード
```go
// calculator パッケージ
package calculator

import "fmt"

// 公開される定数 (大文字始まり)
const MaxValue = 1000

// 公開される関数
func Add(a, b int) int {
	logOperation("Add", a, b) // 非公開関数を呼ぶ
	return a + b
}

// 公開される構造体
type Result struct {
	Operation string // 公開フィールド
	Value     int    // 公開フィールド
	comment   string // 非公開フィールド
}

// 非公開の関数 (小文字始まり)
func logOperation(opName string, a, b int) {
	fmt.Printf("  [internal log] %s(%d, %d)\n", opName, a, b)
}

// 公開される関数 (非公開フィールドを扱う)
func NewResult(op string, val int) *Result {
	return &Result{
		Operation: op,
		Value:     val,
		comment:   "完了", // パッケージ内から非公開フィールドにアクセス
	}
}

// (main パッケージからの呼び出し例は解説参照)
```

## 解説
```text
Goでは、パッケージ内で定義された要素（変数, 定数, 関数, 型,
構造体フィールド, メソッド等）が、他のパッケージからアクセス可能
(**エクスポートされる**) か、パッケージ内部のみで利用可能
(**エクスポートされない**) かは、その**識別子（名前）の
最初の文字**で決まります。

**ルール:**
*   **大文字で始まる識別子:** 他パッケージからアクセス**可能** (公開)。
    パッケージの**公開API**となる。
*   **小文字で始まる識別子:** 定義されたパッケージ内部からのみ
    アクセス**可能** (非公開)。パッケージの**内部実装**となる。

コード例の `calculator` パッケージ:
*   `MaxValue`, `Add`, `Result`, `Result.Operation`, `Result.Value`,
    `NewResult` は大文字始まりなので、他のパッケージ (例: `main`) から
    `calculator.MaxValue` や `calculator.Add(1, 2)` のようにアクセス可能。
*   `logOperation`, `Result.comment` は小文字始まりなので、
    `calculator` パッケージ内部 (例: `Add` や `NewResult` の中) からは
    使えるが、`main` パッケージからはアクセスできずコンパイルエラーになる。

このアクセス制御は、パッケージ利用者に必要なものだけを公開し、
内部実装を隠蔽（カプセル化）するための基本メカニズムです。
これにより、内部実装を変更しても公開APIが変わらなければ、
利用側への影響を抑えられます。