---
title: "I/O 操作: 一時ディレクトリの作成 (`os.MkdirTemp`)"
tags: ["io-operations", "os", "MkdirTemp", "一時ディレクトリ", "temp", "defer", "RemoveAll"]
---

プログラムの実行中に、一時的なファイルやデータを保存するためのディレクトリが必要になることがあります。例えば、テスト中に一時ファイルを作成したり、中間的な処理結果を保存したりする場合などです。このような場合に、システムが提供する一時ディレクトリ内に、衝突しない名前で新しいディレクトリを作成してくれるのが **`os.MkdirTemp`** 関数です。これは Go 1.16 で導入されました。

`import "os"` として利用します。

## `os.MkdirTemp()` の使い方

`os.MkdirTemp()` は、指定されたディレクトリ内に、指定されたパターンに基づいた名前で新しい一時ディレクトリを作成します。

**構文:** `name, err := os.MkdirTemp(dir, pattern string)`

*   `dir`: 一時ディレクトリを作成する親ディレクトリのパスを指定します。
    *   空文字列 (`""`) を指定すると、システムデフォルトの一時ディレクトリ（`os.TempDir()` で取得できるパス、例: `/tmp` や `%TEMP%`）が使われます。通常はこちらを指定します。
*   `pattern`: 作成されるディレクトリ名のパターンを指定します。
    *   パターンにアスタリスク (`*`) が含まれている場合、そのアスタリスクはランダムな文字列に置き換えられ、ユニークなディレクトリ名が生成されます。
    *   アスタリスクが含まれていない場合は、パターン名の末尾にランダムな文字列が付加されます。
    *   例: `"myapp-*"` や `"myapp-"`
*   戻り値:
    *   `name`: 作成された一時ディレクトリのフルパス (`string`)。
    *   `err`: ディレクトリの作成中にエラーが発生した場合、そのエラー。成功した場合は `nil`。

**重要: クリーンアップ**
`os.MkdirTemp` で作成した一時ディレクトリは、プログラムが終了しても**自動的には削除されません**。不要になった時点で、**必ず `os.RemoveAll(name)` を呼び出してディレクトリとその中身を削除**する必要があります。リソースリークやディスク容量の圧迫を防ぐため、**`defer os.RemoveAll(tempDir)`** を使うのが定石です。

## コード例

```go title="os.MkdirTemp の使用例"
package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath" // path/filepath.Join を使うため
)

func main() {
	fmt.Println("一時ディレクトリを作成します...")

	// システムデフォルトの一時ディレクトリ内に "my-temp-app-*" というパターンのディレクトリを作成
	// "*" はランダムな文字列に置き換えられる
	tempDir, err := os.MkdirTemp("", "my-temp-app-*")
	if err != nil {
		log.Fatalf("一時ディレクトリの作成に失敗: %v", err)
	}

	// ★★★ 重要: defer で必ず削除する ★★★
	// この defer により、main 関数がどのように終了しても、
	// 作成された一時ディレクトリとその中身が削除される
	defer func() {
		fmt.Printf("defer: 一時ディレクトリ '%s' を削除します。\n", tempDir)
		err := os.RemoveAll(tempDir) // ディレクトリとその中身をすべて削除
		if err != nil {
			log.Printf("警告: 一時ディレクトリの削除に失敗: %v", err)
		}
	}()

	fmt.Printf("作成された一時ディレクトリ: %s\n", tempDir)

	// --- 作成した一時ディレクトリ内にファイルを作成する例 ---
	filePath := filepath.Join(tempDir, "temp_file.txt") // path/filepath.Join で安全にパスを結合
	content := []byte("これは一時ファイルの内容です。")

	err = os.WriteFile(filePath, content, 0644)
	if err != nil {
		log.Fatalf("一時ファイルへの書き込みに失敗: %v", err)
	}
	fmt.Printf("一時ファイル '%s' を作成しました。\n", filePath)

	// ... ここで一時ディレクトリやファイルを使った処理を行う ...
	fmt.Println("一時ディレクトリ内で何らかの処理を実行中...")

	// main 関数が終了すると、defer によって os.RemoveAll(tempDir) が実行される
}

/* 実行結果の例 (一時ディレクトリのパスは環境や実行ごとに異なる):
一時ディレクトリを作成します...
作成された一時ディレクトリ: /var/folders/xx/yyyy/T/my-temp-app-1234567890
一時ファイル '/var/folders/xx/yyyy/T/my-temp-app-1234567890/temp_file.txt' を作成しました。
一時ディレクトリ内で何らかの処理を実行中...
defer: 一時ディレクトリ '/var/folders/xx/yyyy/T/my-temp-app-1234567890' を削除します。
*/
```

**コード解説:**

*   `os.MkdirTemp("", "my-temp-app-*")`: システムの一時領域に `my-temp-app-` で始まりランダムな文字列が続く名前のディレクトリを作成します。
*   `defer func() { ... os.RemoveAll(tempDir) ... }()`: `defer` を使って、`main` 関数終了時に `os.RemoveAll` が呼び出されるように設定します。`os.RemoveAll` はディレクトリとその中身を再帰的に削除します。
*   `filepath.Join(tempDir, "temp_file.txt")`: プラットフォーム（OS）に依存しない形でディレクトリパスとファイル名を結合します。
*   `os.WriteFile` で一時ディレクトリ内にファイルを作成しています。

`os.MkdirTemp` は、テストコードやバッチ処理などで、一時的な作業スペースが必要な場合に非常に便利です。`defer os.RemoveAll()` による後片付けを忘れないようにしましょう。