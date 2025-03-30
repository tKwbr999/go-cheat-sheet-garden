## タイトル
title: `defer` による後処理の予約

## タグ
tags: ["flow-control", "defer", "クリーンアップ", "リソース解放", "関数"]

## コード
```go
package main

import (
	"fmt"
	"os"
)

// ファイルを作成し、テキストを書き込む関数 (defer の例)
func writeFile(filename, text string) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("ファイル作成失敗: %w", err)
	}
	// ★ファイルを開いた直後にクローズ処理を defer で予約
	defer file.Close()
	fmt.Println("defer file.Close() を登録")

	_, err = file.WriteString(text)
	if err != nil {
		// エラーで return する場合も defer は実行される
		return fmt.Errorf("ファイル書き込み失敗: %w", err)
	}

	fmt.Println("書き込み成功、関数終了")
	// 正常に return する場合も defer は実行される
	return nil
}

// main 関数 (呼び出し例) は省略
// func main() {
// 	writeFile("temp.txt", "Hello defer")
// 	os.Remove("temp.txt")
// }
```

## 解説
```text
Goの **`defer`** 文は、その直後の**関数呼び出し**を、
`defer` 文を含む関数が**終了する直前**まで
遅延させて実行するためのものです。

**基本動作:**
`defer 関数呼び出し(引数)` と書くと、その呼び出しは
すぐには実行されず、現在の関数が `return` するか
パニックで終了する直前に実行されるようスケジュールされます。

**主な用途: リソースのクリーンアップ**
ファイルハンドル、ネットワーク接続、ミューテックスロックなど、
使用後に解放やクローズが必要なリソースを扱う際に非常に役立ちます。

コード例では `os.Create` でファイルを開いた**直後**に
`defer file.Close()` を記述しています。
これにより、`writeFile` 関数が正常に終了しようが、
途中でエラーが発生して `return` しようが、
**関数の終了直前に必ず `file.Close()` が呼び出される**
ことが保証されます。

**`defer` の利点:**
*   **クリーンアップ忘れ防止:** リソース取得の近くに
    解放処理を書けるため、解放忘れを防ぎやすい。
*   **可読性向上:** 確保と解放のコードが近くにまとまり、
    処理の流れが追いやすくなる。

`defer` はGoのエラー処理とリソース管理の堅牢性を
高める重要な機能です。