---
title: "エラー処理: `defer` と組み合わせたエラーハンドリング"
tags: ["error-handling", "error", "defer", "クリーンアップ", "名前付き戻り値"]
---

`defer` はリソースのクリーンアップ（例: `file.Close()`）を保証するのに非常に便利ですが、その**クリーンアップ処理自体がエラーを返す**可能性もあります（例: ファイルのクローズに失敗する）。このような場合、`defer` 内で発生したエラーも適切に処理する必要があります。

## `defer` 内でのエラー処理

単純な `defer file.Close()` では、`Close()` が返したエラーは無視されてしまいます。もしクローズ時のエラーも呼び出し元に伝えたい場合は、`defer` の中で無名関数を使い、その中で `Close()` を呼び出してエラーをチェックする必要があります。

さらに、関数本体の処理で既にエラーが発生している場合に、`Close()` のエラーで上書きしてしまわないように注意が必要です。通常は、**関数本体で発生した最初のエラーを優先**し、`Close()` のエラーは、他にエラーが発生していない場合にのみ返すようにします。

これを実現するために、**名前付き戻り値**がよく使われます。

## 名前付き戻り値を使ったパターン

1.  関数の戻り値として `error` 型に名前を付けます（例: `err error`）。
2.  リソースを開いた直後に `defer` で無名関数を登録します。
3.  その無名関数の中でクリーンアップ処理（例: `f.Close()`）を実行し、エラーを受け取ります (`closeErr`)。
4.  `defer` が実行される時点での関数の戻りエラー `err`（名前付き戻り値なのでアクセス可能）が `nil` であり、かつクリーンアップ処理でエラー `closeErr` が発生した場合にのみ、`err` に `closeErr`（またはそれをラップしたもの）を代入します。

```go title="defer 内でのエラー処理 (名前付き戻り値を使用)"
package main

import (
	"fmt"
	"io"
	"os"
	"strings"
)

// ファイルを処理し、defer 内で Close のエラーも考慮する関数
// ★ 戻り値の error に名前 'err' を付けている
func processFile(filename string) (err error) {
	fmt.Printf("\n--- ファイル '%s' の処理開始 ---\n", filename)

	// 1. ファイルを開く
	f, openErr := os.Open(filename)
	if openErr != nil {
		// ★ open に失敗したら、名前付き戻り値 err に値を設定して return
		//    (return openErr と書いても同じだが、err = ...; return の方が意図が明確な場合も)
		err = fmt.Errorf("ファイルオープン失敗: %w", openErr)
		return // return err と同じ意味 (Naked Return も可能だが非推奨)
	}
	// ★ defer は return の直前に実行される
	//    この defer 内で err の値を変更できる
	defer func() {
		fmt.Println("defer: ファイルをクローズします...")
		closeErr := f.Close()
		if closeErr != nil {
			fmt.Printf("defer: ファイルクローズ時にエラー発生: %v\n", closeErr)
			// ★★★ 重要ポイント ★★★
			// もし関数本体の処理でまだエラーが発生していなければ (err == nil)、
			// Close のエラーを関数の最終的なエラーとして設定する。
			// 既に本体でエラーが発生していれば、そちらを優先し、Close のエラーは無視する
			// (またはログに出力するだけなど)。
			if err == nil {
				err = fmt.Errorf("ファイルクローズ失敗: %w", closeErr)
			} else {
				// 元のエラー err はそのまま保持される
				log.Printf("警告: ファイルクローズエラー (%v) は無視されました。元のエラー: %v", closeErr, err)
			}
		} else {
			fmt.Println("defer: ファイルは正常にクローズされました。")
		}
	}() // defer func() { ... }() で無名関数を定義し、即座に defer 登録

	// 2. ファイルの内容を処理 (例: 読み込んで一部を表示)
	fmt.Println("ファイルの内容を読み込み中...")
	// 簡単のため、エラーが発生する可能性のある処理をシミュレート
	if strings.Contains(filename, "error") {
		// ★ 関数本体でエラーが発生した場合
		err = errors.New("ファイル処理中にエラー発生 (シミュレート)")
		// この場合でも defer は実行されるが、defer 内で err は上書きされない
		return // return err と同じ
	}

	// 成功した場合の処理 (例)
	content, readErr := io.ReadAll(f)
	if readErr != nil {
		err = fmt.Errorf("ファイル読み込み失敗: %w", readErr)
		return // return err と同じ
	}
	fmt.Printf("ファイル内容 (一部): %s...\n", string(content[:min(15, len(content))]))


	fmt.Println("ファイル処理正常終了")
	// 3. 正常終了時、err は nil のまま return される (defer 内で closeErr も nil なら)
	return nil
}

func main() {
	// --- 正常ケース ---
	os.WriteFile("success.txt", []byte("This is a test file."), 0644)
	processFile("success.txt")
	os.Remove("success.txt")

	// --- ファイル処理中にエラーが発生するケース ---
	os.WriteFile("error.txt", []byte("This file causes error."), 0644)
	errProcess := processFile("error.txt")
	if errProcess != nil {
		fmt.Printf("processFile エラー (処理中): %v\n", errProcess)
	}
	os.Remove("error.txt")

	// --- ファイルオープンでエラーが発生するケース ---
	errOpen := processFile("non_existent.txt")
	if errOpen != nil {
		fmt.Printf("processFile エラー (オープン時): %v\n", errOpen)
	}

	// --- ファイルクローズでエラーが発生するケース (シミュレートは難しい) ---
	// 通常、ファイルディスクリプタが無効な場合などに発生しうるが、
	// ここでは defer 内のロジックが機能することを示すのが主目的。
}

// min 関数 (Go 1.21 以降は標準ライブラリにある)
func min(a, b int) int {
	if a < b { return a }
	return b
}
```

**コード解説:**

1.  `func processFile(filename string) (err error)`: 戻り値の `error` に `err` という名前を付けています。これにより、関数内で `err` は通常の変数のように扱え、`defer` 内からもアクセス・変更できます。
2.  `defer func() { ... }()`: `defer` で無名関数を登録します。この無名関数は `processFile` 関数が終了する直前に実行されます。
3.  `closeErr := f.Close()`: `defer` された関数内でファイルのクローズを試み、その結果のエラーを `closeErr` に格納します。
4.  `if err == nil && closeErr != nil { err = ... }`: ここが重要な部分です。
    *   `err == nil`: `defer` が実行される時点で、関数本体の処理（ファイルオープンや読み込みなど）で**まだエラーが発生していない**かを確認します。
    *   `closeErr != nil`: かつ、ファイルのクローズ処理で**エラーが発生した**かを確認します。
    *   両方の条件を満たす場合のみ、関数の最終的な戻りエラー `err` に、クローズ時のエラー `closeErr`（をラップしたもの）を代入します。
    *   もし関数本体で既にエラーが発生していた場合 (`err != nil`) は、`Close` のエラーは無視（またはログ出力）され、元の `err` がそのまま返されます。

このパターンを使うことで、リソースのクリーンアップ処理で発生したエラーを適切にハンドリングしつつ、関数本体で発生したより重要なエラーを上書きしてしまうことを防ぐことができます。少し複雑に見えますが、堅牢なエラー処理を行う上で役立つテクニックです。