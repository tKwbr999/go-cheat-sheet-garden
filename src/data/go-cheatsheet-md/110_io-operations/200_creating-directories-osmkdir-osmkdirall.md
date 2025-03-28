---
title: "I/O 操作: ディレクトリの作成 (`os.Mkdir`, `os.MkdirAll`)"
tags: ["io-operations", "os", "directory", "mkdir", "Mkdir", "MkdirAll", "ディレクトリ作成", "パーミッション", "IsExist"]
---

プログラムでファイルを作成する前に、そのファイルを格納するためのディレクトリを作成する必要がある場合があります。`os` パッケージには、ディレクトリを作成するための関数として **`Mkdir`** と **`MkdirAll`** が用意されています。

`import "os"` として利用します。

## `os.Mkdir(name string, perm FileMode) error`

*   指定された名前 (`name`) で**単一の**新しいディレクトリを作成します。
*   `perm`: 作成するディレクトリのパーミッション（アクセス権）を指定します（例: `0755`, `0700`）。
    *   `0755`: 所有者は読み書き実行可能、グループとその他は読み取り実行可能（一般的なディレクトリのパーミッション）。
*   **注意:** `Mkdir` は、作成しようとしているディレクトリの**親ディレクトリが存在しない**場合、エラーを返します。また、指定した `name` が既に存在する場合もエラーになります。

## `os.MkdirAll(path string, perm FileMode) error`

*   指定されたパス (`path`) に必要な**すべての親ディレクトリを含めて**作成します。
*   `perm`: 作成される**すべての**ディレクトリに適用されるパーミッション。
*   **利点:** `path` の途中のディレクトリが存在しなくても、自動的に作成してくれます。また、`path` が既に存在する場合でもエラーになりません（ただし、それがファイルであった場合はエラーになります）。
*   通常、ディレクトリ構造を確実に作成したい場合は `MkdirAll` を使う方が便利です。

## エラーハンドリング: `os.IsExist()`

`Mkdir` はディレクトリが既に存在する場合にエラーを返しますが、`MkdirAll` は通常エラーを返しません。もし `Mkdir` を使っていて、「既に存在する」というエラーを無視したい場合は、`os.IsExist(err)` 関数を使ってエラーの種類を判別できます。

## コード例

```go title="Mkdir と MkdirAll の使用例"
package main

import (
	"fmt"
	"log"
	"os" // os.Mkdir, os.MkdirAll, os.RemoveAll, os.IsExist を使うため
)

func main() {
	// --- os.Mkdir の例 ---
	fmt.Println("--- os.Mkdir ---")
	dirName1 := "single_dir"
	// 親ディレクトリ (カレントディレクトリ) は存在するので成功するはず
	err := os.Mkdir(dirName1, 0755)
	if err != nil {
		log.Printf("Mkdir('%s') 失敗: %v", dirName1, err)
	} else {
		fmt.Printf("ディレクトリ '%s' を作成しました。\n", dirName1)
	}

	// もう一度同じディレクトリを作成しようとするとエラーになる
	err = os.Mkdir(dirName1, 0755)
	if err != nil {
		fmt.Printf("Mkdir('%s') 再度実行時のエラー: %v\n", dirName1, err)
		// ★ os.IsExist で「既に存在する」エラーか確認 ★
		if os.IsExist(err) {
			fmt.Println("  -> ディレクトリは既に存在していたので、このエラーは無視できます。")
		}
	}

	// 親が存在しないパスを指定するとエラーになる
	err = os.Mkdir("non_existent_parent/child", 0755)
	if err != nil {
		fmt.Printf("Mkdir('non_existent_parent/child') エラー: %v\n", err)
	}

	// --- os.MkdirAll の例 ---
	fmt.Println("\n--- os.MkdirAll ---")
	dirPathAll := "path/to/nested/dir" // ネストしたパス
	// 親ディレクトリ "path", "path/to", "path/to/nested" が存在しなくても自動的に作成される
	err = os.MkdirAll(dirPathAll, 0755)
	if err != nil {
		// 通常、権限がないなどの理由で失敗する
		log.Printf("MkdirAll('%s') 失敗: %v", dirPathAll, err)
	} else {
		fmt.Printf("ディレクトリ '%s' (および親) を作成しました。\n", dirPathAll)
	}

	// もう一度実行してもエラーにならない
	err = os.MkdirAll(dirPathAll, 0755)
	if err != nil {
		log.Printf("MkdirAll('%s') 再度実行時にエラー: %v", dirPathAll, err)
	} else {
		fmt.Printf("MkdirAll('%s') を再度実行してもエラーになりません。\n", dirPathAll)
	}


	// --- 後片付け ---
	fmt.Println("\n--- 後片付け ---")
	// 作成したディレクトリを削除
	// RemoveAll はディレクトリとその中身を再帰的に削除する
	err = os.RemoveAll(dirName1)
	if err == nil { fmt.Printf("'%s' を削除しました。\n", dirName1) }

	// MkdirAll で作成したディレクトリも親から削除できる
	err = os.RemoveAll("path") // "path" ディレクトリを削除すれば、中の "to/nested/dir" も削除される
	if err == nil { fmt.Println("'path' を削除しました。") }
}

/* 実行結果:
--- os.Mkdir ---
ディレクトリ 'single_dir' を作成しました。
Mkdir('single_dir') 再度実行時のエラー: mkdir single_dir: file exists
  -> ディレクトリは既に存在していたので、このエラーは無視できます。
Mkdir('non_existent_parent/child') エラー: mkdir non_existent_parent/child: no such file or directory

--- os.MkdirAll ---
ディレクトリ 'path/to/nested/dir' (および親) を作成しました。
MkdirAll('path/to/nested/dir') を再度実行してもエラーになりません。

--- 後片付け ---
'single_dir' を削除しました。
'path' を削除しました。
*/
```

**コード解説:**

*   `os.Mkdir("single_dir", 0755)`: カレントディレクトリに `single_dir` を作成します。
*   2回目の `os.Mkdir("single_dir", ...)` はエラーになりますが、`os.IsExist(err)` でそれが「既に存在する」エラーであることを確認できます。
*   `os.Mkdir("non_existent_parent/child", ...)` は親ディレクトリが存在しないためエラーになります。
*   `os.MkdirAll("path/to/nested/dir", 0755)`: `path`, `path/to`, `path/to/nested`, `path/to/nested/dir` を必要に応じてすべて作成します。
*   2回目の `os.MkdirAll` は、ディレクトリが既に存在してもエラーになりません。
*   `os.RemoveAll` で作成したディレクトリを後片付けしています。

**使い分け:**

*   単一のディレクトリを作成し、親ディレクトリの存在が保証されている場合は `os.Mkdir`。
*   途中のディレクトリも含めて確実にディレクトリ構造を作成したい場合や、ディレクトリが既に存在してもエラーにしたくない場合は **`os.MkdirAll`** を使うのが一般的で安全です。