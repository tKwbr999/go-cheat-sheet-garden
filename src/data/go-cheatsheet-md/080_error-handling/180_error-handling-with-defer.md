## タイトル
title: `defer` と組み合わせたエラーハンドリング

## タグ
tags: ["error-handling", "error", "defer", "クリーンアップ", "名前付き戻り値"]

## コード
```go
package main

import (
	"fmt"
	"os"
)

// ファイル処理関数 (defer 内で Close のエラーも考慮)
// ★ 戻り値 error に名前 'err' を付ける
func processFile(filename string) (err error) {
	fmt.Printf("\n処理開始: %s\n", filename)
	f, openErr := os.Open(filename)
	if openErr != nil {
		err = fmt.Errorf("オープン失敗: %w", openErr)
		return // err が返る
	}

	// ★ defer でクローズ処理とエラーハンドリング
	defer func() {
		fmt.Println(" defer: クローズ処理...")
		closeErr := f.Close()
		if closeErr != nil {
			fmt.Printf(" defer: クローズエラー: %v\n", closeErr)
			// ★ 関数本体でエラーが発生していなければ (err == nil)、
			//    クローズエラーを関数の最終エラーとする
			if err == nil {
				err = fmt.Errorf("クローズ失敗: %w", closeErr)
			}
			// (本体エラーがあればそちらを優先)
		} else {
			fmt.Println(" defer: クローズ成功")
		}
	}() // defer func() { ... }()

	// --- ファイル処理 (例) ---
	fmt.Println(" ファイル処理中...")
	// if someCondition {
	//     err = errors.New("処理中エラー")
	//     return // この場合でも defer は実行される
	// }

	fmt.Println(" 処理正常終了")
	return nil // 成功時は nil (defer で closeErr も nil なら)
}

func main() {
	// 正常ケース (ファイル作成・削除は省略)
	// os.WriteFile("test.txt", []byte("data"), 0644)
	processFile("test.txt") // 存在しないファイルでオープンエラーを試す

	// os.Remove("test.txt")
}

```

## 解説
```text
`defer` はリソース解放 (`file.Close()` 等) に便利ですが、
そのクリーンアップ処理自体がエラーを返す可能性もあります。
`defer file.Close()` だけではそのエラーは無視されます。

クローズ時のエラーも呼び出し元に伝えたい場合、
`defer` 内で無名関数を使い、エラーをチェックします。

**課題:** 関数本体で既にエラー `err` が発生している場合、
`defer` 内のクローズエラー `closeErr` で `err` を
上書きしたくない（通常は最初のエラーを優先したい）。

**解決策: 名前付き戻り値**
1. 関数の戻り値 `error` に名前を付ける (例: `err error`)。
2. `defer` で登録した無名関数内でクリーンアップ (`f.Close()`) を
   実行し、エラー `closeErr` を受け取る。
3. `defer` 実行時点で、元の戻り値 `err` が `nil` であり、
   かつ `closeErr` が `nil` でない場合にのみ、
   `err` に `closeErr` (またはラップしたもの) を代入する。

コード例の `processFile` 関数:
*   戻り値に `(err error)` と名前を付けています。
*   `defer func() { ... }()` 内で `f.Close()` を呼び出し、
    エラー `closeErr` をチェックします。
*   `if err == nil && closeErr != nil { err = ... }` という
    条件で、関数本体でエラーが発生しておらず、かつクローズで
    エラーが発生した場合にのみ、最終的な戻りエラー `err` を
    クローズエラーで更新しています。
*   これにより、ファイルオープン失敗時や処理中エラー発生時は
    そのエラーが優先され、正常終了時のクローズ失敗エラーのみが
    呼び出し元に伝わります。

このパターンは少し複雑ですが、リソース解放時のエラーも
考慮した堅牢なエラー処理に役立ちます。