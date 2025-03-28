---
title: "エラー処理: センチネルエラー (Sentinel Errors)"
tags: ["error-handling", "error", "errors", "errors.New", "errors.Is", "センチネルエラー"]
---

Goのエラー処理では、特定のエラー状態を表すために、パッケージレベルで**公開されたエラー変数**を定義することがよくあります。これらの事前に定義されたエラー値は**センチネルエラー (Sentinel Error)** と呼ばれます（「番兵」のように特定のエラー状態を見張る役割から）。

センチネルエラーの定義方法と、`errors.Is` を使ってエラーが特定のセンチネルエラー（またはそれをラップしたもの）であるかを確認する方法については、**「エラーは値 (`errors.Is`)」** (`080_error-handling/060_errors-as-values-errorsis.md`) のセクションを参照してください。

## センチネルエラーの定義と利用（再確認）

*   **定義:** 通常、`errors.New` を使ってパッケージレベルの変数として定義します。変数名は大文字で始めるのが一般的です (`var ErrName = errors.New("...")`)。
*   **利用:** 関数は、特定のエラー状態が発生した場合に、この定義済みのセンチネルエラー変数を返します。
*   **判定:** 呼び出し側は、`errors.Is(err, ErrName)` を使って、返されたエラーが特定のセンチネルエラーであるかどうかを判定し、それに応じた処理を行います。

```go title="センチネルエラーの定義と利用例"
package main

import (
	"errors"
	"fmt"
)

// パッケージレベルでセンチネルエラーを定義
var ErrResourceNotFound = errors.New("リソースが見つかりません")
var ErrInvalidInput = errors.New("入力が無効です")

// センチネルエラーを返す可能性のある関数
func fetchData(id int) (string, error) {
	if id <= 0 {
		return "", ErrInvalidInput // 無効な入力エラー
	}
	if id == 404 {
		return "", ErrResourceNotFound // リソースが見つからないエラー
	}
	// 成功
	return fmt.Sprintf("データ %d", id), nil
}

func main() {
	ids := []int{101, 404, -1}

	for _, id := range ids {
		fmt.Printf("\nID %d のデータを取得中...\n", id)
		data, err := fetchData(id)

		if err != nil {
			fmt.Printf("エラー: %v\n", err)
			// errors.Is でセンチネルエラーを判定
			if errors.Is(err, ErrResourceNotFound) {
				fmt.Println("-> リソースが見つかりませんでした。")
			} else if errors.Is(err, ErrInvalidInput) {
				fmt.Println("-> 入力が無効です。")
			} else {
				fmt.Println("-> その他のエラーです。")
			}
		} else {
			fmt.Printf("成功: %s\n", data)
		}
	}
}

/* 実行結果:
ID 101 のデータを取得中...
成功: データ 101

ID 404 のデータを取得中...
エラー: リソースが見つかりません
-> リソースが見つかりませんでした。

ID -1 のデータを取得中...
エラー: 入力が無効です
-> 入力が無効です。
*/
```

センチネルエラーは、パッケージ間で特定のエラー状態を伝達するためのシンプルで効果的な方法です。ただし、エラーに関する追加情報（どのIDが見つからなかったかなど）を含めることができないため、より詳細な情報が必要な場合はカスタムエラー型を使うことを検討します。