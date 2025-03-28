---
title: "パッケージ: エクスポートされる識別子 vs エクスポートされない識別子"
tags: ["packages", "package", "エクスポート", "公開", "非公開", "命名規則", "大文字", "小文字"]
---

Go言語では、パッケージ内で定義された変数、定数、関数、型（構造体など）、メソッドなどが、他のパッケージからアクセス可能（**エクスポートされる**、公開される）か、それとも定義されたパッケージ内でのみ利用可能（**エクスポートされない**、非公開）かは、その**識別子（名前）の最初の文字**によって決まります。

## エクスポートのルール: 大文字 vs 小文字

*   **大文字で始まる識別子:** 他のパッケージから `import` してアクセスすることが**可能**です。これらはパッケージの**公開API (Public API)** の一部となります。
*   **小文字で始まる識別子:** 定義されたパッケージの**内部からのみ**アクセス可能です。他のパッケージからはアクセスできません。これらはパッケージの**内部実装の詳細**となります。

このルールは非常にシンプルですが、Goのパッケージ設計において非常に重要です。これにより、パッケージの作成者は、外部に公開したい機能と、内部的な実装詳細とを明確に区別することができます。

このルールは、以下のすべてのトップレベルの識別子に適用されます。

*   変数 (`var`)
*   定数 (`const`)
*   関数 (`func`)
*   型 (`type`) - 構造体、インターフェース、独自型など
*   構造体のフィールド
*   メソッド

## コード例: `calculator` パッケージ

簡単な計算機能を提供する `calculator` パッケージを例に見てみましょう。

**`calculator/calculator.go`:**
```go
// calculator パッケージ
package calculator

import "fmt"

// --- エクスポートされる要素 (大文字始まり) ---

// MaxValue: 公開される定数
const MaxValue = 1000

// Add: 2つの整数の和を返す公開関数
func Add(a, b int) int {
	// パッケージ内部の非公開関数を呼び出す
	logOperation("Add", a, b)
	return a + b
}

// Subtract: 2つの整数の差を返す公開関数
func Subtract(a, b int) int {
	logOperation("Subtract", a, b)
	return a - b
}

// Result: 計算結果を保持する公開構造体
type Result struct {
	Operation string // 公開フィールド
	Value     int    // 公開フィールド
	comment   string // 非公開フィールド
}

// --- エクスポートされない要素 (小文字始まり) ---

// パッケージ内部でのみ使われる定数
const defaultComment = "計算完了"

// パッケージ内部でのみ使われる変数
var operationCount int = 0

// パッケージ内部でのみ使われる関数 (ログ出力用)
func logOperation(opName string, a, b int) {
	operationCount++
	fmt.Printf("  [calculator internal log] Operation #%d: %s(%d, %d)\n", operationCount, opName, a, b)
}

// NewResult: Result を作成する (非公開フィールド comment も設定)
// この関数自体は公開されているが、非公開フィールド comment を扱える
func NewResult(op string, val int) *Result {
	return &Result{
		Operation: op,
		Value:     val,
		comment:   defaultComment, // パッケージ内なので非公開フィールドにアクセス可能
	}
}
```

**`main.go`:** (別のパッケージから `calculator` を利用)
```go
package main

import (
	"fmt"
	"myproject/calculator" // calculator パッケージをインポート (パスは例)
)

func main() {
	// --- エクスポートされた要素へのアクセス ---
	fmt.Println("calculator パッケージの公開定数:", calculator.MaxValue)

	sum := calculator.Add(10, 5) // 公開関数 Add を呼び出し
	fmt.Println("Add(10, 5) =", sum)

	diff := calculator.Subtract(10, 5) // 公開関数 Subtract を呼び出し
	fmt.Println("Subtract(10, 5) =", diff)

	res := calculator.NewResult("Addition", sum) // 公開関数 NewResult を呼び出し
	fmt.Printf("結果オブジェクト: %+v\n", *res)
	fmt.Println("結果の値:", res.Value) // 公開フィールド Value にアクセス
	// fmt.Println(res.comment) // エラー: res.comment is not exported by package calculator

	// --- エクスポートされない要素へのアクセスは不可 ---
	// fmt.Println(calculator.defaultComment) // エラー: cannot refer to unexported name calculator.defaultComment
	// fmt.Println(calculator.operationCount) // エラー: cannot refer to unexported name calculator.operationCount
	// calculator.logOperation("Test", 1, 1)   // エラー: cannot refer to unexported name calculator.logOperation
}

/* 実行結果:
calculator パッケージの公開定数: 1000
  [calculator internal log] Operation #1: Add(10, 5)
Add(10, 5) = 15
  [calculator internal log] Operation #2: Subtract(10, 5)
Subtract(10, 5) = 5
結果オブジェクト: {Operation:Addition Value:15 comment:計算完了}
結果の値: 15
*/
```

**コード解説:**

*   `calculator` パッケージでは、`MaxValue`, `Add`, `Subtract`, `Result`, `Result.Operation`, `Result.Value`, `NewResult` が大文字で始まっているため、`main` パッケージから `calculator.` を付けてアクセスできます。
*   `defaultComment`, `operationCount`, `logOperation`, `Result.comment` は小文字で始まっているため、`calculator` パッケージの内部（例えば `Add` や `NewResult` 関数の中）からはアクセスできますが、`main` パッケージからはアクセスできず、コンパイルエラーになります。

この大文字・小文字によるアクセス制御は、パッケージの利用者に必要なものだけを公開し、内部の実装詳細を隠蔽（カプセル化）するための基本的なメカニズムです。これにより、パッケージの内部実装を後から変更しても、公開インターフェースが変わらなければ、利用側のコードに影響を与えにくくなります。