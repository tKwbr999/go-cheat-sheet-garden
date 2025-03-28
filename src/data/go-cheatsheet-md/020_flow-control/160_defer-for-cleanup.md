---
title: "制御構文: `defer` による後処理の予約"
tags: ["flow-control", "defer", "クリーンアップ", "リソース解放", "関数"]
---

Go言語には **`defer`** というユニークなキーワードがあります。`defer` 文は、その直後に続く**関数呼び出し**を、`defer` 文を含む関数が**終了する直前**まで遅延させて実行するためのものです。

これは、ファイルハンドル、ネットワーク接続、ミューテックスロックなど、使用後に**解放**や**クローズ**といった後片付け（クリーンアップ）が必要なリソースを扱う際に非常に役立ちます。

## `defer` の基本動作

`defer 関数呼び出し(引数)` のように書くと、その `関数呼び出し` はすぐには実行されません。代わりに、`defer` 文を含む関数が `return` する直前（またはパニックが発生して終了する直前）に実行されるようにスケジュールされます。

## 主な用途: リソースのクリーンアップ

`defer` の最も一般的な使い方は、リソースを開いたり確保したりした直後に、そのリソースを解放する処理を `defer` で記述することです。

```go title="defer を使ったファイルクローズ"
package main

import (
	"fmt"
	"os" // ファイル操作のためのパッケージ
)

// ファイルを作成し、テキストを書き込む関数
func writeFile(filename, text string) error {
	fmt.Printf("ファイル '%s' を作成またはオープンします...\n", filename)
	// os.Create はファイルを作成 (存在すれば上書き) し、*os.File と error を返す
	file, err := os.Create(filename)
	if err != nil {
		// ファイル作成に失敗したらエラーを返す
		return fmt.Errorf("ファイル作成失敗: %w", err)
	}
	// ★★★ ファイルを開いた直後に、クローズ処理を defer で予約 ★★★
	// これにより、この関数がどのように終了しても (正常終了 or エラーで return)、
	// 必ず最後に file.Close() が呼び出されることが保証される。
	defer file.Close()
	fmt.Printf("defer file.Close() を登録しました。\n")

	fmt.Printf("ファイルに '%s' を書き込みます...\n", text)
	// file.WriteString でファイルに文字列を書き込む
	_, err = file.WriteString(text)
	if err != nil {
		// 書き込みに失敗したらエラーを返す (defer された Close はこの return の前に実行される)
		return fmt.Errorf("ファイル書き込み失敗: %w", err)
	}

	fmt.Println("ファイル書き込み成功。関数を終了します。")
	// 関数が正常に終了する場合も、defer された Close はこの return の前に実行される
	return nil // 成功時はエラーなし (nil)
}

func main() {
	filename := "my_temp_file.txt"
	err := writeFile(filename, "Hello from defer!")

	if err != nil {
		fmt.Println("writeFile でエラーが発生しました:", err)
	} else {
		fmt.Println("writeFile は正常に完了しました。")
	}

	// 後片付け (作成したファイルを削除)
	fmt.Printf("一時ファイル '%s' を削除します。\n", filename)
	os.Remove(filename)
}

/* 実行結果:
ファイル 'my_temp_file.txt' を作成またはオープンします...
defer file.Close() を登録しました。
ファイルに 'Hello from defer!' を書き込みます...
ファイル書き込み成功。関数を終了します。
writeFile は正常に完了しました。
一時ファイル 'my_temp_file.txt' を削除します。
*/
```

**コード解説:**

1.  `os.Create(filename)` でファイルを作成（またはオープン）します。
2.  直後の `if err != nil` でファイル作成が成功したかチェックします。
3.  **`defer file.Close()`**: ここがポイントです。ファイルを開いた**直後**に、ファイルのクローズ処理 (`file.Close()`) を `defer` を使って予約しています。
4.  `file.WriteString(text)` でファイルに書き込みます。
5.  関数が `return` する際（正常終了の `return nil` でも、エラー発生時の `return fmt.Errorf(...)` でも）、その `return` の**直前**に `defer` で予約されていた `file.Close()` が自動的に呼び出されます。

## `defer` の利点

*   **クリーンアップ処理の忘れ防止:** リソースを取得したコードのすぐ近くに解放処理を書けるため、関数のどこで `return` しても解放処理が実行されることが保証され、解放忘れを防ぎやすくなります。
*   **コードの可読性向上:** リソースの確保と解放のコードが近くにまとまるため、コードが読みやすくなります。関数の最後にまとめて解放処理を書く場合に比べ、どのリソースが解放されているか追いやすくなります。

`defer` は、Goにおけるエラー処理とリソース管理の堅牢性を高めるための重要な機能です。ファイル操作、ネットワーク接続、データベース接続、ミューテックスのロック/アンロックなど、後片付けが必要な場面で積極的に活用されます。