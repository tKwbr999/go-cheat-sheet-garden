## タイトル
title: エラーは値 (`errors.Is`)

## タグ
tags: ["error-handling", "error", "errors", "errors.Is", "エラーラッピング", "%w", "センチネルエラー"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"os" // os.ErrNotExist
)

// センチネルエラー (パッケージレベルで定義される特定のエラー値)
var ErrItemNotFound = errors.New("アイテムが見つかりません")
var ErrPermissionDenied = errors.New("権限がありません")

// エラーを返す関数 (センチネルエラーまたはラップされたエラー)
func getItem(id int) (string, error) {
	if id == 1 { return "Apple", nil }
	if id == 2 { return "", ErrItemNotFound } // センチネルエラーを返す
	if id == 3 { return "", ErrPermissionDenied }
	originalErr := errors.New("DB接続エラー")
	return "", fmt.Errorf("ID %d 取得失敗: %w", id, originalErr) // ラップされたエラー
}

func main() {
	for _, id := range []int{2, 3, 4} {
		fmt.Printf("\nアイテム %d 取得:\n", id)
		_, err := getItem(id)
		if err != nil {
			fmt.Printf(" エラー: %v\n", err)
			// errors.Is でエラーの種類を判定
			if errors.Is(err, ErrItemNotFound) {
				fmt.Println("  -> 原因: アイテムなし")
			} else if errors.Is(err, ErrPermissionDenied) {
				fmt.Println("  -> 原因: 権限なし")
			} else {
				fmt.Println("  -> 原因: その他")
			}
		}
	}
	// _, errOpen := os.Open("no.txt")
	// if errors.Is(errOpen, os.ErrNotExist) { /* ... */ }
}

```

## 解説
```text
Goの哲学**「エラーは値である」**とは、エラーが特別な制御構文ではなく、
他の値と同様に変数代入、関数からの返却、比較などが可能な
普通の「値」として扱われることを意味します。

**エラー値の比較: `errors.Is()`**
特定の種類のエラー（例: ファイルが見つからない）かを確認したい場合、
単純な `==` 比較は不十分です。
*   `errors.New` は毎回異なるエラー値を生成するため、
    同じメッセージでも `==` は `false` になります。
*   `fmt.Errorf` で `%w` を使ってラップされたエラーの場合、
    `==` では根本原因を比較できません。

そこで Go 1.13 から **`errors.Is()`** 関数が導入されました。
`import "errors"` で利用します。

**構文:** `errors.Is(err, target error) bool`
*   `err`: チェックしたいエラー (ラップされている可能性あり)。
*   `target`: 比較対象の特定エラー値 (通常は**センチネルエラー**)。
*   戻り値: `err` のエラーチェーンを遡り、`target` と**同じエラー値**が
    見つかれば `true`、なければ `false`。

**センチネルエラー:**
パッケージレベルで `var ErrName = errors.New("...")` のように
定義され、特定のエラー状態を示すために公開されるエラー変数。
標準ライブラリの `os.ErrNotExist` などもこれにあたります。

コード例では `ErrItemNotFound` と `ErrPermissionDenied` を
センチネルエラーとして定義し、`getItem` 関数がこれらを返します。
`main` 関数では `errors.Is(err, ErrItemNotFound)` のようにして、
返されたエラー `err` が特定のセンチネルエラー（またはそれをラップしたもの）
であるかを判定しています。

**まとめ:**
*   エラーは値として扱う。
*   特定のエラー状態はセンチネルエラーで示す。
*   エラーが特定のエラー値か（ラップされていても）判定するには
    `errors.Is()` を使う。

`errors.Is` はエラーラッピングと組み合わせることで、
エラーの種類に応じた適切な処理を行うための重要なツールです。