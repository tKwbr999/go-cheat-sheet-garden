## タイトル
title: センチネルエラー (Sentinel Errors)

## タグ
tags: ["error-handling", "error", "errors", "errors.New", "errors.Is", "センチネルエラー"]

## コード
```go
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
	if id <= 0 { return "", ErrInvalidInput }
	if id == 404 { return "", ErrResourceNotFound }
	return fmt.Sprintf("データ %d", id), nil
}

func main() {
	id := 404
	fmt.Printf("ID %d 取得:\n", id)
	_, err := fetchData(id)

	if err != nil {
		fmt.Printf(" エラー: %v\n", err)
		// errors.Is でセンチネルエラーを判定
		if errors.Is(err, ErrResourceNotFound) {
			fmt.Println("  -> 原因: リソースなし")
		} else if errors.Is(err, ErrInvalidInput) {
			fmt.Println("  -> 原因: 無効入力")
		} else {
			fmt.Println("  -> 原因: その他")
		}
	}
}

```

## 解説
```text
特定のエラー状態を表すために、パッケージレベルで
**公開されたエラー変数**を定義することがあります。
これを**センチネルエラー (Sentinel Error)** と呼びます。

**定義と利用:**
*   **定義:** 通常 `errors.New` を使いパッケージレベル変数として定義。
    変数名は大文字で始めるのが一般的。
    `var ErrName = errors.New("エラーメッセージ")`
*   **利用:** 関数は特定のエラー状態発生時に、この定義済み変数を返す。
*   **判定:** 呼び出し側は **`errors.Is(err, ErrName)`** を使い、
    返されたエラー `err` が特定のセンチネルエラー `ErrName`
    (またはそれをラップしたもの) であるか判定し、処理を分岐する。

コード例では `ErrResourceNotFound` と `ErrInvalidInput` を
センチネルエラーとして定義し、`fetchData` 関数がこれらを返します。
`main` 関数では `errors.Is` を使ってエラーの種類を判別しています。

センチネルエラーは、パッケージ間で特定のエラー状態を伝達する
シンプルで効果的な方法です。

ただし、エラーに関する追加情報（どのIDが見つからなかったか等）を
含めることはできません。より詳細な情報が必要な場合は
カスタムエラー型を検討します。